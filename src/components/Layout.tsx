import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900">
      {/* Menu lateral */}
      <aside className="w-full md:w-64 bg-white dark:bg-neutral-800 shadow-md md:h-screen p-4 flex-shrink-0">
        <div className="font-bold text-lg mb-6">MonitorGov</div>
        <nav className="space-y-2">
          <Link href="/" className="block p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">Dashboard</Link>
          <Link href="/processos" className="block p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">Processos</Link>
          <Link href="/contratos" className="block p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">Contratos</Link>
          <Link href="/obras" className="block p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">Obras</Link>
        </nav>
      </aside>
      {/* Conteúdo principal */}
      <main className="flex-1 p-4">
        {/* Topo */}
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel MonitorGov</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-neutral-500">Usuário</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
} 