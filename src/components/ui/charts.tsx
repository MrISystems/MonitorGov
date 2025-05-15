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

interface ChartProps {
  data: Array<{ name: string; value: number }>
  categories?: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function LineChart({ data, categories = ['Valor'] }: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#9ca3af' : '#4b5563'} 
            tick={{ fill: isDark ? '#9ca3af' : '#4b5563' }}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#4b5563'} 
            tick={{ fill: isDark ? '#9ca3af' : '#4b5563' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.375rem',
              color: isDark ? '#f3f4f6' : '#1f2937'
            }}
          />
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey="value"
              stroke={COLORS[index % COLORS.length]}
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PieChart({ data }: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.375rem',
              color: isDark ? '#f3f4f6' : '#1f2937'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Nomes dos componentes para debug
LineChart.displayName = 'LineChart';
PieChart.displayName = 'PieChart';
CustomTooltip.displayName = 'CustomTooltip';
CustomLegend.displayName = 'CustomLegend'; 