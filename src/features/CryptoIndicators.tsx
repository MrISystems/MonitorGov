"use client";
import { useEffect, useState } from "react";
import { getCryptoMarketChart } from "@/services/coingeckoService";
import { sma, rsi, macd } from "@/utils/indicators";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  symbol: string;
}

export default function CryptoIndicators({ symbol }: Props) {
  const [prices, setPrices] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getCryptoMarketChart(symbol, 60);
      setPrices(data.prices.map((p: number[]) => p[1]));
      setLabels(data.prices.map((p: number[]) => new Date(p[0]).toLocaleDateString("pt-BR")));
      setLoading(false);
    }
    fetchData();
  }, [symbol]);

  if (loading) return <div>Carregando indicadores...</div>;

  const sma7 = sma(prices, 7);
  const sma21 = sma(prices, 21);
  const rsi14 = rsi(prices, 14);
  const macdData = macd(prices);

  const chartData = prices.map((price, i) => ({
    name: labels[i],
    Preço: price,
    SMA7: sma7[i],
    SMA21: sma21[i],
    RSI: rsi14[i],
    MACD: macdData.macdLine[i],
    Signal: macdData.signalLine[i],
    Hist: macdData.histogram[i],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold mb-2">Preço & Médias Móveis</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis domain={[Math.min(...prices), Math.max(...prices)]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Preço" stroke="#60a5fa" dot={false} />
            <Line type="monotone" dataKey="SMA7" stroke="#fbbf24" dot={false} />
            <Line type="monotone" dataKey="SMA21" stroke="#f87171" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-bold mb-2">RSI (14)</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="RSI" stroke="#34d399" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-bold mb-2">MACD</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <Tooltip />
            <Line type="monotone" dataKey="MACD" stroke="#818cf8" dot={false} />
            <Line type="monotone" dataKey="Signal" stroke="#f472b6" dot={false} />
            <Line type="monotone" dataKey="Hist" stroke="#facc15" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 