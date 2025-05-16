import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Função para importar dados do CSV
export async function importFromCSV() {
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

  // Processa os registros em lotes de 1000
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map(record => {
      const valorMatch = (record.observacao || record.objeto || '').match(/R\$\s*([\d.,]+)/);
      const valor = valorMatch ? parseFloat(valorMatch[1].replace('.', '').replace(',', '.')) : 0;

      const dataInicioMatch = (record.observacao || record.objeto || '').match(
        /início:?\s*(\d{2}\/\d{2}\/\d{4})/i
      );
      const dataFimMatch = (record.observacao || record.objeto || '').match(
        /fim:?\s*(\d{2}\/\d{2}\/\d{4})/i
      );

      return {
        numero: record.numero || 'Sem número',
        objeto: record.objeto || 'Sem objeto',
        valor,
        dataInicio: dataInicioMatch
          ? new Date(dataInicioMatch[1].split('/').reverse().join('-'))
          : new Date(),
        dataFim: dataFimMatch
          ? new Date(dataFimMatch[1].split('/').reverse().join('-'))
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        fornecedor: record.fornecedor || 'Não informado',
        status: record.status || 'Em andamento',
        responsavel: record.responsavel,
        local: record.local,
        observacao: record.observacao,
      };
    });

    await prisma.contrato.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

export async function ensureDatabase() {
  const count = await prisma.contrato.count();
  if (count === 0) {
    console.log('Importando dados do CSV para o banco de dados...');
    await importFromCSV();
    console.log('Importação concluída!');
  }
}

export async function getContratos(
  page: number = 0,
  pageSize: number = 20,
  filters?: { status?: string; busca?: string }
) {
  const where = {
    AND: [
      filters?.status ? { status: { equals: filters.status, mode: 'insensitive' } } : {},
      filters?.busca
        ? {
            OR: [
              { numero: { contains: filters.busca, mode: 'insensitive' } },
              { objeto: { contains: filters.busca, mode: 'insensitive' } },
              { fornecedor: { contains: filters.busca, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  const [total, data] = await Promise.all([
    prisma.contrato.count({ where }),
    prisma.contrato.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: page * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data,
    total: { count: total },
    hasMore: (page + 1) * pageSize < total,
  };
}

export async function getMetricas() {
  const [totalContratos, contratosPorStatus] = await Promise.all([
    prisma.contrato.count(),
    prisma.contrato.groupBy({
      by: ['status'],
      _count: true,
      orderBy: { _count: { status: 'desc' } },
    }),
  ]);

  return {
    totalContratos,
    contratosPorStatus: contratosPorStatus.map(item => ({
      status: item.status.toLowerCase(),
      quantidade: item._count,
    })),
  };
}

export default prisma;
