// Média Móvel Simples (SMA)
export function sma(data: number[], period: number): number[] {
  return data.map((_, idx, arr) => {
    if (idx < period - 1) return NaN;
    const slice = arr.slice(idx - period + 1, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// Índice de Força Relativa (RSI)
export function rsi(data: number[], period = 14): number[] {
  let gains = 0, losses = 0;
  const rsis: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff > 0) gains += diff;
      else losses -= diff;
      rsis.push(NaN);
      continue;
    }
    if (diff > 0) gains = (gains * (period - 1) + diff) / period;
    else losses = (losses * (period - 1) - diff) / period;
    const rs = losses === 0 ? 100 : gains / losses;
    rsis.push(100 - 100 / (1 + rs));
  }
  return rsis;
}

// MACD (Moving Average Convergence Divergence)
export function macd(data: number[], short = 12, long = 26, signal = 9) {
  const ema = (arr: number[], period: number) => {
    const k = 2 / (period + 1);
    const emaArr: number[] = [];
    arr.forEach((price, i) => {
      if (i === 0) emaArr.push(price);
      else emaArr.push(price * k + emaArr[i - 1] * (1 - k));
    });
    return emaArr;
  };
  const macdLine = ema(data, short).map((v, i) => v - ema(data, long)[i]);
  const signalLine = ema(macdLine, signal);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
} 