import { NextResponse } from 'next/server';

export async function GET() {
  // Dados mockados de processos
  const data = [
    {
      id: '1',
      objeto: 'Aquisição de Equipamentos',
      secretaria: 'Educação',
      status: 'Concluído',
      dataInicio: '2024-04-01',
      dataAtual: '2024-04-20',
      etapas: {
        parecerJuridico: 5,
        ajustesEdital: 3,
        analiseFinanceira: 4,
        outros: 2,
      },
    },
    {
      id: '2',
      objeto: 'Reforma de Escola',
      secretaria: 'Obras',
      status: 'Em Andamento',
      dataInicio: '2024-03-15',
      dataAtual: '2024-04-20',
      etapas: {
        parecerJuridico: 7,
        ajustesEdital: 4,
        analiseFinanceira: 6,
        outros: 3,
      },
    },
    {
      id: '3',
      objeto: 'Compra de Material Didático',
      secretaria: 'Educação',
      status: 'Concluído',
      dataInicio: '2024-02-10',
      dataAtual: '2024-03-01',
      etapas: {
        parecerJuridico: 3,
        ajustesEdital: 2,
        analiseFinanceira: 2,
        outros: 1,
      },
    },
  ];
  return NextResponse.json(data);
} 