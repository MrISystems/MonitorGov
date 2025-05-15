'use client';

import { useContratosInfinite } from '@/hooks/useContratos';
import { Skeleton } from '@/components/ui/skeleton';
import { formatarMoeda } from '@/lib/utils';
import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Contrato } from '@/types/contratos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de status do contrato
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('concluído')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('andamento')) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

// Componente de linha do contrato
const ContratoRow = memo(({ contrato, style }: { contrato: Contrato; style: React.CSSProperties }) => {
  return (
    <div
      style={{
        ...style,
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
      }}
      className="hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{contrato.numero}</h3>
            <StatusBadge status={contrato.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {contrato.objeto}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>Início: {format(new Date(contrato.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
            <span>Fim: {format(new Date(contrato.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="font-medium">
            {formatarMoeda(contrato.valor)}
          </p>
          <p className="text-sm text-muted-foreground">
            {contrato.fornecedor}
          </p>
          {contrato.responsavel && (
            <p className="text-xs text-muted-foreground mt-1">
              Responsável: {contrato.responsavel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
ContratoRow.displayName = 'ContratoRow';

// Componente de filtros
const FiltrosContratos = memo(({ 
  busca, 
  setBusca, 
  statusFiltro, 
  setStatusFiltro 
}: { 
  busca: string;
  setBusca: (value: string) => void;
  statusFiltro: string;
  setStatusFiltro: (value: string) => void;
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Buscar por número ou objeto"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white dark:bg-neutral-900"
      />
      <select
        value={statusFiltro}
        onChange={e => setStatusFiltro(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white dark:bg-neutral-900"
      >
        <option value="">Todos os status</option>
        <option value="Vigente">Vigente</option>
        <option value="Encerrado">Encerrado</option>
        <option value="Em renovação">Em renovação</option>
        <option value="Em andamento">Em andamento</option>
        <option value="Concluído">Concluído</option>
      </select>
    </div>
  );
});
FiltrosContratos.displayName = 'FiltrosContratos';

// Componente principal
export function InfiniteContratosList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [busca, setBusca] = useState('');
  
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useContratosInfinite();

  // Combina todos os contratos de todas as páginas
  const allContratos = data?.pages.flatMap(page => page.data) ?? [];

  // Filtros aplicados localmente com useCallback
  const contratosFiltrados = useCallback(() => {
    return allContratos.filter((contrato) => {
      const statusOk = statusFiltro ? contrato.status.toLowerCase() === statusFiltro.toLowerCase() : true;
      const buscaOk = busca
        ? contrato.numero.toLowerCase().includes(busca.toLowerCase()) ||
          contrato.objeto.toLowerCase().includes(busca.toLowerCase())
        : true;
      return statusOk && buscaOk;
    });
  }, [allContratos, statusFiltro, busca])();

  const rowVirtualizer = useVirtualizer({
    count: contratosFiltrados.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Detecta quando o usuário está próximo do final da lista
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= contratosFiltrados.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    contratosFiltrados.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Erro ao carregar os contratos. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <h2 className="text-2xl font-bold">Contratos</h2>
        <FiltrosContratos
          busca={busca}
          setBusca={setBusca}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
        />
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const contrato = contratosFiltrados[virtualRow.index];
                
                if (!contrato) {
                  return (
                    <div
                      key="loading"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="p-4"
                    >
                      <Skeleton className="h-24 w-full" />
                    </div>
                  );
                }

                return (
                  <ContratoRow
                    key={contrato.id}
                    contrato={contrato}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 