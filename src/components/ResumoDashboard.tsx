import React, { memo } from "react";
import { Card, CardContent } from "./ui/card";

interface ResumoDashboardProps {
  totalProcessos: number;
  totalContratos: number;
  processosConcluidos: number;
  processosEmAndamento: number;
}

interface MetricCardProps {
  label: string;
  value: number;
  className?: string;
}

// Componente de card de métrica
const MetricCard = memo(({ label, value, className = "" }: MetricCardProps) => (
  <Card className={`${className}`}>
    <CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </CardContent>
  </Card>
));
MetricCard.displayName = 'MetricCard';

// Componente principal
const ResumoDashboard = memo(({
  totalProcessos,
  totalContratos,
  processosConcluidos,
  processosEmAndamento,
}: ResumoDashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="Total de Processos"
        value={totalProcessos}
      />
      <MetricCard
        label="Total de Contratos"
        value={totalContratos}
      />
      <MetricCard
        label="Processos Concluídos"
        value={processosConcluidos}
      />
      <MetricCard
        label="Processos em Andamento"
        value={processosEmAndamento}
      />
    </div>
  );
});
ResumoDashboard.displayName = 'ResumoDashboard';

export default ResumoDashboard; 