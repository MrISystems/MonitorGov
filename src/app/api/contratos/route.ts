import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Contrato } from '@/types/contratos';

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
    // Verifica se há cache válido
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      const { searchParams } = new URL(request.url);
      const cursor = searchParams.get('cursor');
      const pageSize = 20;

      const startIndex = cursor ? parseInt(cursor, 10) : 0;
      const endIndex = startIndex + pageSize;
      const hasMore = endIndex < cache.data.length;

      return NextResponse.json({
        data: cache.data.slice(startIndex, endIndex),
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

    // Processa os dados
    const contratos = validarDados(records.map(mapearContrato));
    const metricas = calcularMetricas(contratos);

    // Atualiza o cache
    cache = {
      data: contratos,
      timestamp: Date.now(),
      metricas,
    };

    // Retorna a primeira página
    const pageSize = 20;
    return NextResponse.json({
      data: contratos.slice(0, pageSize),
      nextCursor: contratos.length > pageSize ? pageSize.toString() : undefined,
      metricas,
    });

  } catch (error) {
    console.error('Erro ao processar contratos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar contratos' },
      { status: 500 }
    );
  }
} 