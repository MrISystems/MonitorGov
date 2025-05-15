"use client";

import React, { memo, useCallback, useMemo } from 'react';
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
import { useTheme } from 'next-themes';

// Tipos
interface ChartData {
  name: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

// Cores acessíveis com contraste adequado e suporte a tema
const useChartColors = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => [
    { 
      fill: isDark ? '#60A5FA' : '#2563EB', 
      stroke: isDark ? '#3B82F6' : '#1E40AF',
      text: isDark ? '#E5E7EB' : '#1F2937'
    }, // Azul
    { 
      fill: isDark ? '#34D399' : '#059669', 
      stroke: isDark ? '#10B981' : '#047857',
      text: isDark ? '#E5E7EB' : '#1F2937'
    }, // Verde
    { 
      fill: isDark ? '#FBBF24' : '#D97706', 
      stroke: isDark ? '#F59E0B' : '#B45309',
      text: isDark ? '#E5E7EB' : '#1F2937'
    }, // Laranja
    { 
      fill: isDark ? '#F87171' : '#DC2626', 
      stroke: isDark ? '#EF4444' : '#B91C1C',
      text: isDark ? '#E5E7EB' : '#1F2937'
    }, // Vermelho
    { 
      fill: isDark ? '#A78BFA' : '#7C3AED', 
      stroke: isDark ? '#8B5CF6' : '#6D28D9',
      text: isDark ? '#E5E7EB' : '#1F2937'
    }, // Roxo
  ], [isDark]);
};

// Componente de tooltip acessível
const CustomTooltip = memo(({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div 
      role="tooltip"
      aria-label={`Dados para ${label}`}
      className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
    >
      <p className="text-sm font-medium mb-1">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry, index) => (
          <li 
            key={index}
            className="text-sm flex items-center gap-2"
            style={{ color: entry.color }}
          >
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span>
              {entry.name}: {entry.value.toLocaleString('pt-BR')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Componente de legenda acessível
const CustomLegend = memo(({ payload }: LegendProps) => {
  if (!payload?.length) return null;

  return (
    <ul 
      role="list"
      className="flex flex-wrap gap-4 justify-center mt-4"
      aria-label="Legenda do gráfico"
    >
      {payload.map((entry, index) => (
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
CustomLegend.displayName = 'CustomLegend';

// Componente de gráfico de linha otimizado e acessível
export const LineChart = memo(({ 
  data, 
  categories,
  height = 300,
  showLegend = true,
}: { 
  data: ChartData[]; 
  categories: string[];
  height?: number;
  showLegend?: boolean;
}) => {
  const colors = useChartColors();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatYAxis = useCallback((value: number) => {
    return value.toLocaleString('pt-BR');
  }, []);

  const gridColor = useMemo(() => 
    isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    [isDark]
  );

  const textColor = useMemo(() => 
    isDark ? '#E5E7EB' : '#1F2937',
    [isDark]
  );

  return (
    <div 
      role="img" 
      aria-label="Gráfico de evolução temporal"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          accessibilityLayer
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: textColor }}
            tickLine={{ stroke: textColor }}
            tickFormatter={(value) => value}
            aria-label="Datas"
          />
          <YAxis
            tick={{ fill: textColor }}
            tickLine={{ stroke: textColor }}
            tickFormatter={formatYAxis}
            aria-label="Valores"
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ 
              stroke: textColor, 
              strokeWidth: 1, 
              strokeDasharray: '3 3' 
            }}
          />
          {showLegend && <Legend content={<CustomLegend />} />}
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index % colors.length].fill}
              strokeWidth={2}
              dot={{ 
                r: 4, 
                fill: colors[index % colors.length].fill,
                stroke: colors[index % colors.length].stroke,
                strokeWidth: 2
              }}
              activeDot={{ 
                r: 8, 
                fill: colors[index % colors.length].stroke,
                stroke: colors[index % colors.length].fill,
                strokeWidth: 2
              }}
              name={category}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Componente de gráfico de pizza otimizado e acessível
export const PieChart = memo(({ 
  data,
  height = 300,
  showLegend = true,
}: { 
  data: ChartData[];
  height?: number;
  showLegend?: boolean;
}) => {
  const colors = useChartColors();
  const total = useMemo(() => 
    data.reduce((acc, item) => acc + item.value, 0),
    [data]
  );
  
  const formatLabel = useCallback(({ name, percent }: { name: string; percent: number }) => {
    const value = (percent * 100).toFixed(0);
    return `${name} (${value}%)`;
  }, []);

  return (
    <div 
      role="img" 
      aria-label="Gráfico de distribuição"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={formatLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            aria-label="Distribuição por categoria"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={colors[index % colors.length].fill}
                stroke={colors[index % colors.length].stroke}
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
          {showLegend && (
            <Legend 
              content={<CustomLegend />}
              layout="horizontal"
              verticalAlign="bottom"
            />
          )}
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