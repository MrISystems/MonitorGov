import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// Schema de validação para contratos
export const contratoSchema = z.object({
  id: z.string().min(1),
  numero: z.string().min(1),
  objeto: z.string().min(1),
  valor: z.number().min(0),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fornecedor: z.string().min(1),
  status: z.string().min(1),
  responsavel: z.string().optional(),
  local: z.string().optional(),
  observacao: z.string().optional(),
});

// Schema de validação para processos
export const processoSchema = z.object({
  id: z.string().min(1),
  objeto: z.string().min(1),
  secretaria: z.string().min(1),
  status: z.string().min(1),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataAtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  etapas: z.object({
    parecerJuridico: z.number().min(0),
    ajustesEdital: z.number().min(0),
    analiseFinanceira: z.number().min(0),
    outros: z.number().min(0),
  }),
  responsavel: z.string().optional(),
  local: z.string().optional(),
  observacao: z.string().optional(),
});

// Função para sanitizar strings
export function sanitizeString(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // Não permite tags HTML
    allowedAttributes: {}, // Não permite atributos
    disallowedTagsMode: 'recursiveEscape',
  }).trim();
}

// Função para validar e sanitizar dados
export function validateAndSanitize<T>(data: unknown, schema: z.ZodSchema<T>): T {
  // Sanitiza strings antes da validação
  if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        (data as any)[key] = sanitizeString(value);
      }
    });
  }

  // Valida os dados
  return schema.parse(data);
}

// Função para validar parâmetros de consulta
export function validateQueryParams(params: URLSearchParams, schema: z.ZodSchema<any>) {
  const queryObj: Record<string, string> = {};
  params.forEach((value, key) => {
    queryObj[key] = sanitizeString(value);
  });

  return schema.parse(queryObj);
}

// Função para limitar taxa de requisições
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Obtém ou inicializa o array de timestamps para o IP
    const timestamps = this.requests.get(ip) || [];

    // Remove timestamps antigos
    const recentTimestamps = timestamps.filter(time => time > windowStart);

    // Verifica se excedeu o limite
    if (recentTimestamps.length >= this.maxRequests) {
      return true;
    }

    // Adiciona novo timestamp
    recentTimestamps.push(now);
    this.requests.set(ip, recentTimestamps);

    return false;
  }

  // Limpa timestamps antigos periodicamente
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, timestamps] of this.requests.entries()) {
      const recentTimestamps = timestamps.filter(time => time > windowStart);
      if (recentTimestamps.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, recentTimestamps);
      }
    }
  }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter();

// Limpa timestamps antigos a cada minuto
setInterval(() => rateLimiter.cleanup(), 60000);

// Função para validar origem da requisição
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://monitorgov.vercel.app',
  ].filter(Boolean);

  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

// Função para gerar hash seguro
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função para validar token CSRF
export async function validateCsrfToken(token: string, secret: string): Promise<boolean> {
  const expectedToken = await generateHash(secret + process.env.NEXTAUTH_SECRET);
  return token === expectedToken;
}
