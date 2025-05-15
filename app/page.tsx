'use client';

import RelatoriosDashboard from '../src/components/RelatoriosDashboard';

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">MonitorGov online AGORA!</h1>
      <RelatoriosDashboard />
    </main>
  );
}
