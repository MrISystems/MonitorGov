import React from "react";

interface ResumoDashboardProps {
  totalProcessos: number;
  totalContratos: number;
  processosConcluidos: number;
  processosEmAndamento: number;
}

export default function ResumoDashboard({
  totalProcessos,
  totalContratos,
  processosConcluidos,
  processosEmAndamento,
}: ResumoDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-neutral-800 rounded shadow p-4">
        <div className="text-xs text-neutral-400">Total de Processos</div>
        <div className="text-2xl font-bold">{totalProcessos}</div>
      </div>
      <div className="bg-white dark:bg-neutral-800 rounded shadow p-4">
        <div className="text-xs text-neutral-400">Total de Contratos</div>
        <div className="text-2xl font-bold">{totalContratos}</div>
      </div>
      <div className="bg-white dark:bg-neutral-800 rounded shadow p-4">
        <div className="text-xs text-neutral-400">Processos Concluídos</div>
        <div className="text-2xl font-bold">{processosConcluidos}</div>
      </div>
      <div className="bg-white dark:bg-neutral-800 rounded shadow p-4">
        <div className="text-xs text-neutral-400">Processos em Andamento</div>
        <div className="text-2xl font-bold">{processosEmAndamento}</div>
      </div>
    </div>
  );
} 