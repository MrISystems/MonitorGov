import { useInfiniteQuery } from '@tanstack/react-query';
import type { Contrato } from '@/types/contratos';

interface ContratosResponse {
  data: Contrato[];
  nextCursor?: string;
  metricas: {
    totalContratos: number;
    contratosPorStatus: {
      status: string;
      quantidade: number;
    }[];
  };
}

async function fetchContratos(cursor?: string): Promise<ContratosResponse> {
  const params = new URLSearchParams();
  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await fetch(`/api/contratos?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar contratos');
  }

  return response.json();
}

export function useContratosInfinite() {
  return useInfiniteQuery({
    queryKey: ['contratos'],
    queryFn: ({ pageParam }) => fetchContratos(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Mantendo o hook original para compatibilidade
export function useContratos(filters: ContratosFilters = {}) {
  const { page = 1, pageSize = 20, ...rest } = filters;

  return useInfiniteQuery({
    queryKey: ['contratos', filters],
    queryFn: ({ pageParam = page }) => fetchContratos({ ...filters, pageParam }),
    getNextPageParam: lastPage => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: page,
  });
}

export type { Contrato, ContratosResponse, ContratosFilters };
