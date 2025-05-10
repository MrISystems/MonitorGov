"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface AssetSuggestion {
  name: string;
  symbol: string;
  type: string;
  price: number;
  change: number;
}

const MOCK_B3: AssetSuggestion[] = [
  { name: "Vale", symbol: "VALE3", type: "Ação BR", price: 70.12, change: 2.1 },
  { name: "Petrobras", symbol: "PETR4", type: "Ação BR", price: 34.55, change: 1.7 },
  { name: "XP Malls", symbol: "XPML11", type: "FII", price: 110.20, change: 1.2 },
  { name: "HGLG", symbol: "HGLG11", type: "FII", price: 180.00, change: 0.9 },
];

const MOCK_SP500: AssetSuggestion[] = [
  { name: "Apple", symbol: "AAPL", type: "Ação EUA", price: 190.10, change: 1.8 },
  { name: "Microsoft", symbol: "MSFT", type: "Ação EUA", price: 320.50, change: 1.5 },
];

export default function Suggestions() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "brl",
            order: "price_change_percentage_24h_desc",
            per_page: 5,
            page: 1,
            price_change_percentage: "24h",
          },
        }
      );
      setCoins(res.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Sugestões de Ativos em Alta (Criptomoedas)</h2>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ul className="space-y-2 mb-8">
          {coins.map((coin) => (
            <li key={coin.id} className="flex items-center justify-between bg-neutral-800 rounded p-3">
              <div className="flex items-center gap-2">
                <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                <span className="font-semibold">{coin.name}</span>
                <span className="text-xs text-neutral-400">({coin.symbol.toUpperCase()})</span>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </div>
                <div className="text-sm text-neutral-300">
                  R$ {coin.current_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <h2 className="text-xl font-bold mb-4">Sugestões de Ações e FIIs (Mock)</h2>
      <ul className="space-y-2 mb-8">
        {MOCK_B3.map((asset) => (
          <li key={asset.symbol} className="flex items-center justify-between bg-neutral-800 rounded p-3">
            <div>
              <span className="font-semibold">{asset.name}</span> <span className="text-xs text-neutral-400">({asset.symbol})</span>
              <span className="ml-2 text-xs text-neutral-400">{asset.type}</span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">{asset.change.toFixed(2)}%</div>
              <div className="text-sm text-neutral-300">R$ {asset.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-bold mb-4">Sugestões de Ações EUA (Mock)</h2>
      <ul className="space-y-2">
        {MOCK_SP500.map((asset) => (
          <li key={asset.symbol} className="flex items-center justify-between bg-neutral-800 rounded p-3">
            <div>
              <span className="font-semibold">{asset.name}</span> <span className="text-xs text-neutral-400">({asset.symbol})</span>
              <span className="ml-2 text-xs text-neutral-400">{asset.type}</span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">{asset.change.toFixed(2)}%</div>
              <div className="text-sm text-neutral-300">US$ {asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 