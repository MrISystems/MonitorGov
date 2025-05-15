'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ObrasPage() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch('/api/relatorios/processos')
      .then(res => res.json())
      .then(data => {
        // Filtra processos que são obras (exemplo: objeto contém "obra")
        const obrasFiltradas = (data.processos || []).filter(proc =>
          proc.objeto?.toLowerCase().includes('obra')
        );
        setObras(obrasFiltradas);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar obras.');
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Obras Públicas</h2>
      {loading && <div>Carregando...</div>}
      {erro && <div className="text-red-500">{erro}</div>}
      <ul className="space-y-2">
        {obras.length === 0 && !loading && <li>Nenhuma obra encontrada.</li>}
        {obras.map(obra => (
          <li key={obra.id} className="p-4 bg-white dark:bg-neutral-800 rounded shadow">
            <div className="font-semibold">
              {obra.id} - {obra.objeto}
            </div>
            <div className="text-sm text-neutral-500">
              Status: {obra.status} | Secretaria: {obra.secretaria}
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
