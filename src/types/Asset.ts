export type AssetType = 'crypto' | 'acao-br' | 'acao-eua' | 'bdr' | 'fii' | 'renda-fixa' | 'previdencia';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
  currency: string;
} 