import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Contrato } from '@/types/contratos';
import { 
  validateAndSanitize, 
  contratoSchema, 
  validateQueryParams,
  rateLimiter,
  validateOrigin,
  validateCsrfToken
} from '@/lib/security';
import { z } from 'zod';

// Schema para parâmetros de consulta
const querySchema = z.object({
  cursor: z.string().optional(),
  status: z.string().optional(),
  busca: z.string().optional(),
});

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos
let cache: {
  data: Contrato[];
  timestamp: number;
  metricas: {
    totalContratos: number;
    contratosPorStatus: { status: string; quantidade: number; }[];
  };
} | null = null;

function mapearContrato(record: Record<string, string>): Contrato {
  // Extrai o valor do contrato do campo observação ou objeto
  const valorMatch = (record.observacao || record.objeto || '').match(/R\$\s*([\d.,]+)/);
  const valor = valorMatch ? parseFloat(valorMatch[1].replace('.', '').replace(',', '.')) : 0;

  // Extrai datas do campo observação ou objeto
  const dataInicioMatch = (record.observacao || record.objeto || '').match(/início:?\s*(\d{2}\/\d{2}\/\d{4})/i);
  const dataFimMatch = (record.observacao || record.objeto || '').match(/fim:?\s*(\d{2}\/\d{2}\/\d{4})/i);

  const dataInicio = dataInicioMatch 
    ? format(new Date(dataInicioMatch[1].split('/').reverse().join('-')), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const dataFim = dataFimMatch
    ? format(new Date(dataFimMatch[1].split('/').reverse().join('-')), 'yyyy-MM-dd')
    : format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // +1 ano

  return {
    id: record.id || Math.random().toString(36).substring(7),
    numero: record.numero || 'Sem número',
    objeto: record.objeto || 'Sem objeto',
    valor,
    dataInicio,
    dataFim,
    fornecedor: record.fornecedor || 'Não informado',
    status: record.status || 'Em andamento',
    responsavel: record.responsavel || undefined,
    local: record.local || undefined,
    observacao: record.observacao || undefined,
  };
}

function validarDados(contratos: Contrato[]): Contrato[] {
  return contratos.filter(contrato => {
    // Filtra registros inválidos
    if (!contrato.numero || contrato.numero === 'Sem número') return false;
    if (!contrato.objeto || contrato.objeto === 'Sem objeto') return false;
    if (!contrato.fornecedor || contrato.fornecedor === 'Não informado') return false;
    return true;
  });
}

function calcularMetricas(contratos: Contrato[]) {
  const totalContratos = contratos.length;
  
  // Agrupa contratos por status
  const statusMap = new Map<string, number>();
  contratos.forEach(contrato => {
    const status = contrato.status.toLowerCase();
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const contratosPorStatus = Array.from(statusMap.entries()).map(([status, quantidade]) => ({
    status,
    quantidade,
  }));

  return {
    totalContratos,
    contratosPorStatus,
  };
}

export async function GET(request: Request) {
  try {
    // Validação de origem
    const origin = request.headers.get('origin');
    if (!validateOrigin(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Origem não permitida' }),
        { status: 403 }
      );
    }

    // Validação de CSRF
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !await validateCsrfToken(csrfToken, request.headers.get('x-request-id') || '')) {
      return new NextResponse(
        JSON.stringify({ error: 'Token CSRF inválido' }),
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimiter.isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisições. Tente novamente mais tarde.' }),
        { status: 429 }
      );
    }

    // Validação de parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const query = validateQueryParams(searchParams, querySchema);

    // Verifica se há cache válido
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      const pageSize = 20;
      const startIndex = query.cursor ? parseInt(query.cursor, 10) : 0;
      const endIndex = startIndex + pageSize;

      // Filtra por status se especificado
      let filteredData = cache.data;
      if (query.status) {
        filteredData = filteredData.filter(c => 
          c.status.toLowerCase() === query.status?.toLowerCase()
        );
      }

      // Filtra por busca se especificado
      if (query.busca) {
        const busca = query.busca.toLowerCase();
        filteredData = filteredData.filter(c =>
          c.numero.toLowerCase().includes(busca) ||
          c.objeto.toLowerCase().includes(busca) ||
          c.fornecedor.toLowerCase().includes(busca)
        );
      }

      const hasMore = endIndex < filteredData.length;

      return NextResponse.json({
        data: filteredData.slice(startIndex, endIndex),
        nextCursor: hasMore ? endIndex.toString() : undefined,
        metricas: cache.metricas,
      });
    }

    // Lê o arquivo CSV
    const dataDir = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataDir);
    const contratosFile = files.find(f => f.includes('CONTRATOS.csv'));

    if (!contratosFile) {
      throw new Error('Arquivo de contratos não encontrado');
    }

    const filePath = path.join(dataDir, contratosFile);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Processa e valida os dados
    const contratos = validarDados(
      records.map(record => validateAndSanitize(mapearContrato(record), contratoSchema))
    );
    const metricas = calcularMetricas(contratos);

    // Atualiza o cache
    cache = {
      data: contratos,
      timestamp: Date.now(),
      metricas,
    };

    // Retorna a primeira página com filtros aplicados
    const pageSize = 20;
    let filteredData = contratos;

    if (query.status) {
      filteredData = filteredData.filter(c => 
        c.status.toLowerCase() === query.status?.toLowerCase()
      );
    }

    if (query.busca) {
      const busca = query.busca.toLowerCase();
      filteredData = filteredData.filter(c =>
        c.numero.toLowerCase().includes(busca) ||
        c.objeto.toLowerCase().includes(busca) ||
        c.fornecedor.toLowerCase().includes(busca)
      );
    }

    return NextResponse.json({
      data: filteredData.slice(0, pageSize),
      nextCursor: filteredData.length > pageSize ? pageSize.toString() : undefined,
      metricas,
    });

  } catch (error) {
    console.error('Erro ao processar contratos:', error);
    
    // Não expõe detalhes do erro em produção
    const isProd = process.env.NODE_ENV === 'production';
    const errorMessage = isProd 
      ? 'Erro ao processar contratos' 
      : error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 