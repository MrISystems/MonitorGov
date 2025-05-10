// Serviço base para buscar dados de ações americanas (S&P500)
// No futuro, pode ser integrado com APIs como Alpha Vantage, Yahoo Finance, etc.

export async function getSP500AssetPrice(symbol: string) {
  // Exemplo de mock
  return {
    symbol,
    price: 20.0,
    currency: 'USD',
    updatedAt: new Date().toISOString(),
  };
} 