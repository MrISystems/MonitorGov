import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-neutral-800 rounded shadow p-4">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500 dark:text-neutral-300">{children}</p>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
} 