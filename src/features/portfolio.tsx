"use client";
import { useEffect, useState } from "react";
import { Asset, AssetType } from "@/types/Asset";
import dynamic from "next/dynamic";
const CryptoIndicators = dynamic(() => import("./CryptoIndicators"), { ssr: false });

const ASSET_TYPES: { label: string; value: AssetType }[] = [
  { label: "Criptomoeda", value: "crypto" },
  { label: "Ação BR", value: "acao-br" },
  { label: "Ação EUA", value: "acao-eua" },
  { label: "BDR", value: "bdr" },
  { label: "FII", value: "fii" },
  { label: "Renda Fixa", value: "renda-fixa" },
  { label: "Previdência", value: "previdencia" },
];

export default function Portfolio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState<Partial<Asset>>({ type: "crypto" });
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) setAssets(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(assets));
  }, [assets]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.symbol || !form.type || !form.quantity || !form.averagePrice || !form.currency) return;
    setAssets([
      ...assets,
      {
        id: Date.now().toString(),
        name: form.name,
        symbol: form.symbol,
        type: form.type as AssetType,
        quantity: Number(form.quantity),
        averagePrice: Number(form.averagePrice),
        currency: form.currency,
      } as Asset,
    ]);
    setForm({ type: "crypto" });
  }

  function handleRemove(id: string) {
    setAssets(assets.filter((a) => a.id !== id));
  }

  // Cálculo de performance
  const valorInvestido = assets.reduce((acc, a) => acc + a.quantity * a.averagePrice, 0);
  // Mock: valor atual = investido + 5% para simular rentabilidade
  const valorAtual = valorInvestido * 1.05;
  const rentabilidade = valorInvestido > 0 ? ((valorAtual - valorInvestido) / valorInvestido) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meu Portfólio</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-neutral-800 rounded p-4 flex-1 min-w-[180px]">
          <div className="text-xs text-neutral-400">Valor Investido</div>
          <div className="text-lg font-bold">R$ {valorInvestido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
        </div>
        <div className="bg-neutral-800 rounded p-4 flex-1 min-w-[180px]">
          <div className="text-xs text-neutral-400">Valor Atual (mock)</div>
          <div className="text-lg font-bold">R$ {valorAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
        </div>
        <div className="bg-neutral-800 rounded p-4 flex-1 min-w-[180px]">
          <div className="text-xs text-neutral-400">Rentabilidade</div>
          <div className={rentabilidade >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {rentabilidade.toFixed(2)}%
          </div>
        </div>
      </div>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6 items-end">
        <input name="name" placeholder="Nome" value={form.name || ""} onChange={handleChange} className="border p-2 rounded flex-1" required />
        <input name="symbol" placeholder="Símbolo" value={form.symbol || ""} onChange={handleChange} className="border p-2 rounded w-24" required />
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
          {ASSET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input name="quantity" type="number" step="any" placeholder="Qtd" value={form.quantity || ""} onChange={handleChange} className="border p-2 rounded w-20" required />
        <input name="averagePrice" type="number" step="any" placeholder="Preço Médio" value={form.averagePrice || ""} onChange={handleChange} className="border p-2 rounded w-28" required />
        <input name="currency" placeholder="Moeda" value={form.currency || ""} onChange={handleChange} className="border p-2 rounded w-16" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Adicionar</button>
      </form>
      <ul className="space-y-2">
        {assets.map((asset) => (
          <li key={asset.id} className="flex items-center justify-between bg-neutral-900 rounded p-3">
            <div>
              <span className="font-semibold cursor-pointer underline" onClick={() => asset.type === 'crypto' && setSelectedCrypto(asset.symbol)}>{asset.name}</span> <span className="text-xs text-neutral-400">({asset.symbol})</span>
              <div className="text-sm text-neutral-300">{asset.type} | Qtd: {asset.quantity} | PM: {asset.averagePrice} {asset.currency}</div>
            </div>
            <button onClick={() => handleRemove(asset.id)} className="text-red-400 hover:text-red-600">Remover</button>
          </li>
        ))}
      </ul>
      {selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedCrypto(null)} className="absolute top-2 right-2 text-white text-xl">&times;</button>
            <h2 className="text-lg font-bold mb-4">Indicadores Técnicos ({selectedCrypto.toUpperCase()})</h2>
            <CryptoIndicators symbol={selectedCrypto} />
          </div>
        </div>
      )}
    </div>
  );
} 