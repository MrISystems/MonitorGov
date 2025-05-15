import { Metadata } from 'next';
import { InfiniteContratosList } from '@/components/InfiniteContratosList';
import Layout from "@/components/Layout";
import RelatoriosDashboard from "@/components/RelatoriosDashboard";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard - MonitorGov',
  description: 'Painel principal do MonitorGov com indicadores e relatórios em tempo real',
};

export default function Home() {
  return (
    <Layout>
      <main className="container mx-auto py-8 px-4 space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel MonitorGov</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Acompanhe em tempo real todos os processos, contratos e obras
          </p>
        </header>

        <Suspense fallback={<div>Carregando relatórios...</div>}>
          <RelatoriosDashboard />
        </Suspense>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Contratos Recentes</h2>
          <Suspense fallback={<div>Carregando contratos...</div>}>
            <InfiniteContratosList />
          </Suspense>
        </section>
      </main>
    </Layout>
  );
}