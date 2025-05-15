import React, { memo, useCallback } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Cores acessíveis com contraste adequado
const COLORS = [
  { fill: '#2563EB', stroke: '#1E40AF' }, // Azul
  { fill: '#059669', stroke: '#047857' }, // Verde
  { fill: '#D97706', stroke: '#B45309' }, // Laranja
  { fill: '#DC2626', stroke: '#B91C1C' }, // Vermelho
  { fill: '#7C3AED', stroke: '#6D28D9' }, // Roxo
];

// Componente de tooltip acessível
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        role="tooltip"
        aria-label={`Dados para ${label}`}
        className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
      >
        <p className="text-sm font-medium mb-1">{label}</p>
        <ul className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <li 
              key={index}
              className="text-sm flex items-center gap-2"
              style={{ color: entry.color }}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}: {entry.value.toLocaleString('pt-BR')}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
});

// Componente de legenda acessível
const CustomLegend = memo(({ payload }: any) => {
  return (
    <ul 
      role="list"
      className="flex flex-wrap gap-4 justify-center mt-4"
      aria-label="Legenda do gráfico"
    >
      {payload.map((entry: any, index: number) => (
        <li 
          key={index}
          className="flex items-center gap-2 text-sm"
          style={{ color: entry.color }}
        >
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
});

// Componente de gráfico de linha otimizado e acessível
export const LineChart = memo(({ data, categories }: { data: any[]; categories: string[] }) => {
  const formatYAxis = useCallback((value: number) => {
    return value.toLocaleString('pt-BR');
  }, []);

  return (
    <div role="img" aria-label="Gráfico de evolução temporal">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          accessibilityLayer
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            strokeOpacity={0.2}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            tickFormatter={(value) => value}
            aria-label="Datas"
          />
          <YAxis
            tick={{ fill: '#6B7280' }}
            tickLine={{ stroke: '#6B7280' }}
            tickFormatter={formatYAxis}
            aria-label="Valores"
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS[0].fill}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS[0].fill }}
            activeDot={{ r: 8, fill: COLORS[0].stroke }}
            name="Quantidade"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Componente de gráfico de pizza otimizado e acessível
export const PieChart = memo(({ data }: { data: { name: string; value: number }[] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <div role="img" aria-label="Gráfico de distribuição">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              const value = (percent * 100).toFixed(0);
              return `${name} (${value}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            aria-label="Distribuição por categoria"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length].fill}
                stroke={COLORS[index % COLORS.length].stroke}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            formatter={(value: number) => [
              value.toLocaleString('pt-BR'),
              `${((value / total) * 100).toFixed(1)}% do total`
            ]}
          />
          <Legend 
            content={<CustomLegend />}
            layout="horizontal"
            verticalAlign="bottom"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
});

// Nomes dos componentes para debug
LineChart.displayName = 'LineChart';
PieChart.displayName = 'PieChart';
CustomTooltip.displayName = 'CustomTooltip';
CustomLegend.displayName = 'CustomLegend'; 