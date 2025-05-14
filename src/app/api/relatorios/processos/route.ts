import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/sync';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    let processos: any[] = [];
    let contratos: any[] = [];

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const records = csvParse.parse(content, {
        columns: true,
        skip_empty_lines: true,
      });
      if (file.toLowerCase().includes('contrato')) {
        contratos = contratos.concat(records);
      } else {
        processos = processos.concat(records);
      }
    }

    return NextResponse.json({ processos, contratos });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao ler os dados dos processos/contratos', details: error.message }, { status: 500 });
  }
} 