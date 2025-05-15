"use client";
import { InfiniteContratosList } from '@/components/InfiniteContratosList';
import Layout from "@/components/Layout";
import RelatoriosDashboard from "@/components/RelatoriosDashboard";

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold mb-6">Painel MonitorGov</h1>
        <RelatoriosDashboard />
        <InfiniteContratosList />
      </div>
    </Layout>
  );
}