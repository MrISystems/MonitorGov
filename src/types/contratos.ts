export interface Contrato {
  id: string;
  numero: string;
  objeto: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  fornecedor: string;
  status: string;
  responsavel?: string;
  local?: string;
  observacao?: string;
}

export interface ContratosResponse {
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

export interface ContratosFilters {
  search?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  valorMin?: number;
  valorMax?: number;
  fornecedor?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Contrato;
  sortOrder?: 'asc' | 'desc';
}
