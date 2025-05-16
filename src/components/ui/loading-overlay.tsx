import { LoadingAnimation } from './lottie-animation';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, message, className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        'flex flex-col items-center justify-center',
        'transition-opacity duration-200',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingAnimation />
        {message && <p className="text-sm text-muted-foreground font-medium">{message}</p>}
      </div>
    </div>
  );
}

// Exemplo de uso em um componente de dados
export function DataLoadingState({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[200px]">
      <LoadingOverlay isLoading={isLoading} message="Carregando dados..." />
      {children}
    </div>
  );
}

// Exemplo de uso em um formulário
export function FormLoadingState({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <LoadingOverlay isLoading={isLoading} message="Processando..." className="bg-background/60" />
      {children}
    </div>
  );
}

// Exemplo de uso em uma tabela
export function TableLoadingState({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <LoadingOverlay
        isLoading={isLoading}
        message="Carregando registros..."
        className="bg-background/40"
      />
      {children}
    </div>
  );
}
