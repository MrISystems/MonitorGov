import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function getCryptoPrice(symbol: string) {
  const res = await axios.get(`${COINGECKO_API}/simple/price`, {
    params: {
      ids: symbol,
      vs_currencies: 'brl,usd',
    },
  });
  return res.data;
}

export async function getCryptoMarketChart(symbol: string, days = 30) {
  const res = await axios.get(`${COINGECKO_API}/coins/${symbol}/market_chart`, {
    params: {
      vs_currency: 'brl',
      days,
    },
  });
  return res.data;
} 