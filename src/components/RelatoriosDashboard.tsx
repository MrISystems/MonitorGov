import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LineChart, BarChart, PieChart } from "./ui/charts";
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResumoDashboard from './ResumoDashboard';

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
}

export default function RelatoriosDashboard() {
  const [periodo, setPeriodo] = useState('abril');
  const [dadosProcessos, setDadosProcessos] = useState<ProcessoData[]>([]);
  const [dadosContratos, setDadosContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/relatorios/processos');
      const data = await response.json();
      setDadosProcessos(data.processos || []);
      setDadosContratos(data.contratos || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = () => {
    if (!dadosProcessos.length) return null;

    const metricas = {
      tempoMedioParecer: 0,
      tempoMedioAjustes: 0,
      tempoMedioFinanceiro: 0,
      totalProcessos: dadosProcessos.length,
      processosConcluidos: 0,
      processosEmAndamento: 0,
    };

    dadosProcessos.forEach(processo => {
      metricas.tempoMedioParecer += processo.etapas.parecerJuridico;
      metricas.tempoMedioAjustes += processo.etapas.ajustesEdital;
      metricas.tempoMedioFinanceiro += processo.etapas.analiseFinanceira;
      
      if (processo.status === 'Concluído') {
        metricas.processosConcluidos++;
      } else {
        metricas.processosEmAndamento++;
      }
    });

    // Calcular médias
    metricas.tempoMedioParecer /= dadosProcessos.length;
    metricas.tempoMedioAjustes /= dadosProcessos.length;
    metricas.tempoMedioFinanceiro /= dadosProcessos.length;

    return metricas;
  };

  const metricas = calcularMetricas();

  // Cálculo dos resumos
  const totalProcessos = dadosProcessos.length;
  const totalContratos = dadosContratos.length;
  const processosConcluidos = dadosProcessos.filter((p) => p.status === 'Concluído').length;
  const processosEmAndamento = dadosProcessos.filter((p) => p.status !== 'Concluído').length;

  // Gráfico de evolução temporal dos processos (por dataAtual)
  const processosPorDia: Record<string, number> = {};
  dadosProcessos.forEach((p) => {
    const data = p.dataAtual || p.dataInicio;
    if (data) {
      const dia = format(new Date(data), 'dd/MM/yyyy');
      processosPorDia[dia] = (processosPorDia[dia] || 0) + 1;
    }
  });
  const evolucaoData = Object.keys(processosPorDia)
    .sort((a, b) => {
      const da = parse(a, 'dd/MM/yyyy', new Date());
      const db = parse(b, 'dd/MM/yyyy', new Date());
      return da.getTime() - db.getTime();
    })
    .map((dia) => ({ name: dia, value: processosPorDia[dia] }));

  // Gráfico de pizza: distribuição por secretaria
  const processosPorSecretaria: Record<string, number> = {};
  dadosProcessos.forEach((p) => {
    if (p.secretaria) {
      processosPorSecretaria[p.secretaria] = (processosPorSecretaria[p.secretaria] || 0) + 1;
    }
  });
  const pieData = Object.entries(processosPorSecretaria).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6">
      <ResumoDashboard
        totalProcessos={totalProcessos}
        totalContratos={totalContratos}
        processosConcluidos={processosConcluidos}
        processosEmAndamento={processosEmAndamento}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatório de Processos - {periodo}</h1>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abril">Abril 2024</SelectItem>
            <SelectItem value="marco">Março 2024</SelectItem>
            <SelectItem value="fevereiro">Fevereiro 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio Parecer Jurídico</CardTitle>
                <CardDescription>Dias</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metricas?.tempoMedioParecer.toFixed(1)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio Ajustes</CardTitle>
                <CardDescription>Dias</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metricas?.tempoMedioAjustes.toFixed(1)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio Análise Financeira</CardTitle>
                <CardDescription>Dias</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metricas?.tempoMedioFinanceiro.toFixed(1)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total de Processos</CardTitle>
                <CardDescription>Status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metricas?.totalProcessos}</p>
                <p className="text-sm text-muted-foreground">
                  {metricas?.processosConcluidos} concluídos / {metricas?.processosEmAndamento} em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Temporal dos Processos</CardTitle>
                <CardDescription>Por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={evolucaoData}
                  categories={evolucaoData.map((d) => d.name)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Secretaria</CardTitle>
                <CardDescription>Total de processos</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={pieData}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}