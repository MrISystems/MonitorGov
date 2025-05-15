'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ContratosPage() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch('/api/contratos')
      .then(res => res.json())
      .then(data => {
        setContratos(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar contratos.');
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Contratos</h2>
      {loading && <div>Carregando...</div>}
      {erro && <div className="text-red-500">{erro}</div>}
      <ul className="space-y-2">
        {contratos.length === 0 && !loading && <li>Nenhum contrato encontrado.</li>}
        {contratos.map((contrato, idx) => (
          <li
            key={contrato.id + '-' + idx}
            className="p-4 bg-white dark:bg-neutral-800 rounded shadow"
          >
            <div className="font-semibold">
              {contrato.numero} - {contrato.objeto}
            </div>
            <div className="text-sm text-neutral-500">
              Fornecedor: {contrato.fornecedor} | Status: {contrato.status}
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
