import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, PieChart } from "@/components/ui/charts";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export function RelatoriosDashboard() {
  const [periodo, setPeriodo] = useState('abril');
  const [dadosProcessos, setDadosProcessos] = useState<ProcessoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // TODO: Implementar chamada à API para buscar dados
      const response = await fetch('/api/relatorios/processos');
      const data = await response.json();
      setDadosProcessos(data);
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

  return (
    <div className="p-6">
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
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={[
                    { name: 'Jan', value: 30 },
                    { name: 'Fev', value: 40 },
                    { name: 'Mar', value: 35 },
                    { name: 'Abr', value: 50 },
                    { name: 'Mai', value: 49 },
                    { name: 'Jun', value: 60 },
                    { name: 'Jul', value: 70 },
                    { name: 'Ago', value: 91 },
                    { name: 'Set', value: 125 }
                  ]}
                  categories={['Processos']}
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
                  data={[
                    { name: 'Secretaria A', value: 400 },
                    { name: 'Secretaria B', value: 300 },
                    { name: 'Secretaria C', value: 300 },
                    { name: 'Secretaria D', value: 200 }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 