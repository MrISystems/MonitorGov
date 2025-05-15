"use client";

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from 'next-themes';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface LineChartData {
  name: string;
  data: number[];
}

interface LineChartProps {
  series: LineChartData[];
  categories: string[];
}

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function SuperLineChart({ series, categories }: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const chartData = categories.map((category, index) => ({
    name: category,
    value: series[0].data[index]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: textColor }} />
        <YAxis tick={{ fill: textColor }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            color: textColor
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function CustomBarChart({ series, categories }: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const chartData = categories.map((category, index) => ({
    name: category,
    value: series[0].data[index]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: textColor }} />
        <YAxis tick={{ fill: textColor }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            color: textColor
          }}
        />
        <Bar dataKey="value" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({ data }: PieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E5E7EB' : '#1F2937';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            color: textColor
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export { SuperLineChart, CustomBarChart, PieChart }; 