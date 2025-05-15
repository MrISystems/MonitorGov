'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, PieChart } from '@/components/ui/charts';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResumoDashboard from './ResumoDashboard';
import { formatarMoeda } from '@/lib/utils';

// Tipos
interface ProcessoData {
  id: string;
  objeto: string;
  secretaria: string;
  status: string;
  dataInicio: string;
  dataAtual: string;
  etapas: {
    parecerJuridico: number;
    ajustesEdital: number;
    analiseFinanceira: number;
    outros: number;
  };
  responsavel: string;
  local: string;
  observacao: string;
}

interface ContratoData {
  id: string;
  numero: string;
  objeto: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  fornecedor: string;
  status: string;
  responsavel: string;
  local: string;
  observacao: string;
}

interface ApiResponse {
  processos: ProcessoData[];
  contratos: ContratoData[];
  metricas: {
    totalProcessos: number;
    totalContratos: number;
    processosConcluidos: number;
    processosEmAndamento: number;
    valorTotalContratos: number;
  };
}

// Componentes de loading
const LoadingChart = memo(() => (
  <div className="h-[200px] flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded animate-pulse">
    Carregando gráfico...
  </div>
));
LoadingChart.displayName = 'LoadingChart';

const LoadingCard = memo(() => (
  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 animate-pulse">
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
  </div>
));
LoadingCard.displayName = 'LoadingCard';

// Componente de valor total
const ValorTotalCard = memo(({ valorTotal }: { valorTotal: number }) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle>Valor Total dos Contratos</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center">
      <p className="text-3xl font-bold">{formatarMoeda(valorTotal)}</p>
    </CardContent>
  </Card>
));
ValorTotalCard.displayName = 'ValorTotalCard';

// Componente de contratos por status
const ContratosStatusCard = memo(({ data }: { data: Array<{ name: string; value: number }> }) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle>Contratos por Status</CardTitle>
    </CardHeader>
    <CardContent>
      <PieChart data={data} />
    </CardContent>
  </Card>
));
ContratosStatusCard.displayName = 'ContratosStatusCard';

// Componente de evolução dos processos
const EvolucaoProcessosCard = memo(({ data }: { data: Array<{ name: string; value: number }> }) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="text-center">
        <CardTitle>Evolução dos Processos</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={data} categories={['Processos']} />
      </CardContent>
    </Card>
  );
});
EvolucaoProcessosCard.displayName = 'EvolucaoProcessosCard';

// Componente de processos por secretaria
const ProcessosSecretariaCard = memo(
  ({ data }: { data: Array<{ name: string; value: number }> }) => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Processos por Secretaria</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={data} />
      </CardContent>
    </Card>
  )
);
ProcessosSecretariaCard.displayName = 'ProcessosSecretariaCard';

// Componente de último processo
const UltimoProcessoItem = memo(({ processo }: { processo: ProcessoData }) => (
  <div className="p-4 bg-muted rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium">{processo.id}</h3>
        <p className="text-sm text-muted-foreground">{processo.objeto}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{processo.secretaria}</p>
        <p className="text-xs text-muted-foreground">{processo.status}</p>
      </div>
    </div>
  </div>
));
UltimoProcessoItem.displayName = 'UltimoProcessoItem';

// Componente de últimos processos
const UltimosProcessosCard = memo(({ processos }: { processos: ProcessoData[] }) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle>Últimos Processos</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {processos.slice(0, 5).map(processo => (
          <UltimoProcessoItem key={processo.id} processo={processo} />
        ))}
      </div>
    </CardContent>
  </Card>
));
UltimosProcessosCard.displayName = 'UltimosProcessosCard';

// Hook personalizado para carregar dados
const useDashboardData = () => {
  const [periodo, setPeriodo] = useState('abril');
  const [dadosProcessos, setDadosProcessos] = useState<ProcessoData[]>([]);
  const [dadosContratos, setDadosContratos] = useState<ContratoData[]>([]);
  const [metricas, setMetricas] = useState<ApiResponse['metricas'] | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/relatorios/processos', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });
      const data: ApiResponse = await response.json();
      setDadosProcessos(data.processos || []);
      setDadosContratos(data.contratos || []);
      setMetricas(data.metricas || null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    periodo,
    setPeriodo,
    dadosProcessos,
    dadosContratos,
    metricas,
    loading,
    carregarDados,
  };
};

// Componente principal
export default function RelatoriosDashboard() {
  const { dadosProcessos, dadosContratos, metricas, loading } = useDashboardData();

  const evolucaoData = useMemo(() => {
    const processosPorDia: Record<string, number> = {};
    dadosProcessos.forEach(p => {
      const data = p.dataAtual || p.dataInicio;
      if (data) {
        const dia = format(new Date(data), 'dd/MM/yyyy');
        processosPorDia[dia] = (processosPorDia[dia] || 0) + 1;
      }
    });

    return Object.keys(processosPorDia)
      .sort((a, b) => {
        const da = parse(a, 'dd/MM/yyyy', new Date());
        const db = parse(b, 'dd/MM/yyyy', new Date());
        return da.getTime() - db.getTime();
      })
      .map(dia => ({ name: dia, value: processosPorDia[dia] }));
  }, [dadosProcessos]);

  const pieData = useMemo(() => {
    const processosPorSecretaria: Record<string, number> = {};
    dadosProcessos.forEach(p => {
      if (p.secretaria) {
        processosPorSecretaria[p.secretaria] = (processosPorSecretaria[p.secretaria] || 0) + 1;
      }
    });
    return Object.entries(processosPorSecretaria).map(([name, value]) => ({ name, value }));
  }, [dadosProcessos]);

  const contratosPorStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    dadosContratos.forEach(c => {
      if (c.status) {
        statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      }
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [dadosContratos]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <LoadingCard />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Suspense fallback={<LoadingCard />}>
        {metricas && (
          <ResumoDashboard
            totalProcessos={metricas.totalProcessos}
            totalContratos={metricas.totalContratos}
            processosConcluidos={metricas.processosConcluidos}
            processosEmAndamento={metricas.processosEmAndamento}
          />
        )}
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricas && <ValorTotalCard valorTotal={metricas.valorTotalContratos} />}
        <ContratosStatusCard data={contratosPorStatus} />
        <EvolucaoProcessosCard data={evolucaoData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessosSecretariaCard data={pieData} />
        <UltimosProcessosCard processos={dadosProcessos} />
      </div>
    </div>
  );
}
