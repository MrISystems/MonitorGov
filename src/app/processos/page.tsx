'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ProcessosPage() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch('/api/relatorios/processos')
      .then(res => res.json())
      .then(data => {
        setProcessos(data.processos || []);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar processos.');
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Processos de Compras</h2>
      {loading && <div>Carregando...</div>}
      {erro && <div className="text-red-500">{erro}</div>}
      <ul className="space-y-2">
        {processos.length === 0 && !loading && <li>Nenhum processo encontrado.</li>}
        {processos.map((proc, idx) => (
          <li key={proc.id + '-' + idx} className="p-4 bg-white dark:bg-neutral-800 rounded shadow">
            <div className="font-semibold">
              {proc.id} - {proc.objeto}
            </div>
            <div className="text-sm text-neutral-500">
              Status: {proc.status} | Secretaria: {proc.secretaria}
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
