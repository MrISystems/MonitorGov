import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { format, parse as parseDate, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  validateAndSanitize, 
  processoSchema, 
  contratoSchema,
  validateQueryParams,
  rateLimiter,
  validateOrigin,
  validateCsrfToken
} from '@/lib/security';
import { z } from 'zod';
// import { zlib } from 'zlib';
// import { promisify } from 'util';

// const gzip = promisify(zlib.gzip);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
let cache: {
  data: any;
  timestamp: number;
} | null = null;

// Função auxiliar para calcular dias entre datas
const calcularDiasEntre = (dataInicio: string, dataFim: string): number => {
  try {
    const inicio = parseDate(dataInicio, 'dd/MM/yyyy', new Date());
    const fim = parseDate(dataFim, 'dd/MM/yyyy', new Date());
    return differenceInDays(fim, inicio);
  } catch {
    return 0;
  }
};

// Função para calcular métricas das etapas
const calcularMetricasEtapas = (record: any) => {
  const entradaCLMP = record['ENTRADA  NA CLMP'];
  const saidaCLMP = record['SAÍDA DA CLMP'];
  const dataAtual = record.DATA;
  const status = record.STATUS?.toLowerCase() || '';

  // Cálculo baseado no status e datas
  let parecerJuridico = 0;
  let ajustesEdital = 0;
  let analiseFinanceira = 0;
  let outros = 0;

  if (entradaCLMP && saidaCLMP) {
    const diasCLMP = calcularDiasEntre(entradaCLMP, saidaCLMP);
    
    // Distribuição dos dias baseada no status
    if (status.includes('jurídico') || status.includes('saj')) {
      parecerJuridico = diasCLMP;
    } else if (status.includes('ajuste') || status.includes('edital')) {
      ajustesEdital = diasCLMP;
    } else if (status.includes('financeiro') || status.includes('sf')) {
      analiseFinanceira = diasCLMP;
    } else {
      outros = diasCLMP;
    }
  }

  return {
    parecerJuridico,
    ajustesEdital,
    analiseFinanceira,
    outros
  };
};

// Mapeamento dos campos do CSV para o formato do sistema
const mapearProcesso = (record: any) => {
  const etapas = calcularMetricasEtapas(record);
  
  return {
    id: record.PC || '',
    objeto: record.OBJETO || '',
    secretaria: record.PASTA || '',
    status: record.STATUS || '',
    dataInicio: record['ENTRADA  NA CLMP'] ? format(parseDate(record['ENTRADA  NA CLMP'], 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : '',
    dataAtual: record.DATA ? format(parseDate(record.DATA, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : '',
    etapas,
    responsavel: record.RESPONSÁVEL || '',
    local: record.LOCAL || '',
    observacao: record.OBSERVAÇÃO || ''
  };
};

const mapearContrato = (record: any) => {
  // Tentativa de extrair valor do objeto ou observação
  const extrairValor = (texto: string): number => {
    const match = texto.match(/R\$\s*([\d.,]+)/);
    if (match) {
      return parseFloat(match[1].replace('.', '').replace(',', '.'));
    }
    return 0;
  };

  const valor = extrairValor(record.OBSERVAÇÃO || record.OBJETO || '');

  return {
    id: record.PC || '',
    numero: record['N° CONTRATO'] || '',
    objeto: record.OBJETO || '',
    valor,
    dataInicio: record['ENTRADA  NA CLMP'] ? format(parseDate(record['ENTRADA  NA CLMP'], 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : '',
    dataFim: record.VENCIMENTO ? format(parseDate(record.VENCIMENTO, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : '',
    fornecedor: record.CONTRATADA || '',
    status: record.STATUS || '',
    responsavel: record.RESPONSÁVEL || '',
    local: record.LOCAL || '',
    observacao: record.OBSERVAÇÃO || ''
  };
};

// Função para validar e limpar os dados
const validarDados = (dados: any[]) => {
  return dados.filter(item => {
    // Remove registros sem ID ou objeto
    if (!item.id || !item.objeto) return false;
    
    // Remove registros com datas inválidas
    if (item.dataInicio && isNaN(new Date(item.dataInicio).getTime())) return false;
    if (item.dataAtual && isNaN(new Date(item.dataAtual).getTime())) return false;
    if (item.dataFim && isNaN(new Date(item.dataFim).getTime())) return false;
    
    return true;
  });
};

// Schema para parâmetros de consulta
const querySchema = z.object({
  periodo: z.enum(['hoje', 'semana', 'mes', 'todos']).optional(),
  secretaria: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    // Validação de origem - temporariamente desabilitada para desenvolvimento
    // const origin = request.headers.get('origin');
    // if (!validateOrigin(origin)) {
    //   return new NextResponse(
    //     JSON.stringify({ error: 'Origem não permitida' }),
    //     { status: 403 }
    //   );
    // }

    // Validação de CSRF - temporariamente desabilitada para desenvolvimento
    // const csrfToken = request.headers.get('x-csrf-token');
    // if (!csrfToken || !await validateCsrfToken(csrfToken, request.headers.get('x-request-id') || '')) {
    //   return new NextResponse(
    //     JSON.stringify({ error: 'Token CSRF inválido' }),
    //     { status: 403 }
    //   );
    // }

    // Rate limiting - mantido para evitar sobrecarga
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

    // Verificar cache
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      let filteredData = { ...cache.data };

      // Aplica filtros se especificados
      if (query.secretaria) {
        filteredData.processos = filteredData.processos.filter(
          (p: any) => p.secretaria.toLowerCase() === query.secretaria?.toLowerCase()
        );
      }

      if (query.status) {
        filteredData.processos = filteredData.processos.filter(
          (p: any) => p.status.toLowerCase() === query.status?.toLowerCase()
        );
      }

      if (query.periodo) {
        const now = new Date();
        const filterDate = (date: string) => {
          const d = new Date(date);
          switch (query.periodo) {
            case 'hoje':
              return d.toDateString() === now.toDateString();
            case 'semana':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return d >= weekAgo;
            case 'mes':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return d >= monthAgo;
            default:
              return true;
          }
        };

        filteredData.processos = filteredData.processos.filter(
          (p: any) => filterDate(p.dataAtual)
        );
      }

      // Recalcula métricas com dados filtrados
      filteredData.metricas = {
        totalProcessos: filteredData.processos.length,
        totalContratos: filteredData.contratos.length,
        processosConcluidos: filteredData.processos.filter(
          (p: any) => p.status.toLowerCase().includes('concluído')
        ).length,
        processosEmAndamento: filteredData.processos.filter(
          (p: any) => !p.status.toLowerCase().includes('concluído')
        ).length,
        valorTotalContratos: filteredData.contratos.reduce(
          (sum: number, c: any) => sum + (c.valor || 0), 
          0
        )
      };

      return NextResponse.json(filteredData, {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      throw new Error('Diretório de dados não encontrado');
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    if (files.length === 0) {
      throw new Error('Nenhum arquivo CSV encontrado');
    }

    let processos: any[] = [];
    let contratos: any[] = [];

    // Processar arquivos em paralelo
    await Promise.all(files.map(async (file) => {
      try {
        const filePath = path.join(dataDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
          delimiter: ',',
          trim: true,
          skipRecordsWithError: true
        });
        
        if (file.toLowerCase().includes('contrato')) {
          contratos = contratos.concat(
            records.map((record: any) => 
              validateAndSanitize(mapearContrato(record), contratoSchema)
            )
          );
        } else {
          processos = processos.concat(
            records.map((record: any) => 
              validateAndSanitize(mapearProcesso(record), processoSchema)
            )
          );
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file}:`, error);
      }
    }));

    // Validar e limpar os dados
    processos = validarDados(processos);
    contratos = validarDados(contratos);

    // Ordenar por data mais recente
    processos.sort((a, b) => new Date(b.dataAtual).getTime() - new Date(a.dataAtual).getTime());
    contratos.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());

    const data = { 
      processos, 
      contratos,
      metricas: {
        totalProcessos: processos.length,
        totalContratos: contratos.length,
        processosConcluidos: processos.filter(p => p.status.toLowerCase().includes('concluído')).length,
        processosEmAndamento: processos.filter(p => !p.status.toLowerCase().includes('concluído')).length,
        valorTotalContratos: contratos.reduce((sum, c) => sum + (c.valor || 0), 0)
      }
    };
    
    // Atualizar cache
    cache = {
      data,
      timestamp: Date.now(),
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Erro ao processar dados:', error);
    
    // Não expõe detalhes do erro em produção
    const isProd = process.env.NODE_ENV === 'production';
    const errorMessage = isProd 
      ? 'Erro ao processar dados' 
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