import { NextResponse } from 'next/server';
import {
  validateQueryParams,
  validateOrigin,
  validateCsrfToken,
  rateLimiter,
} from '@/lib/security';
import { z } from 'zod';
import { getContratos, getMetricas } from '@/lib/db';

// Schema para parâmetros de consulta
const querySchema = z.object({
  cursor: z.string().optional(),
  status: z.string().optional(),
  busca: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    // Validação de origem
    const origin = request.headers.get('origin');
    if (!validateOrigin(origin)) {
      return new NextResponse(JSON.stringify({ error: 'Origem não permitida' }), { status: 403 });
    }

    // Validação de CSRF
    const csrfToken = request.headers.get('x-csrf-token');
    if (
      !csrfToken ||
      !(await validateCsrfToken(csrfToken, request.headers.get('x-request-id') || ''))
    ) {
      return new NextResponse(JSON.stringify({ error: 'Token CSRF inválido' }), { status: 403 });
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimiter.isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisições. Tente novamente mais tarde.' }),
        { status: 429 }
      );
    }

    // Validação de parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const query = validateQueryParams(searchParams, querySchema);

    const page = query.cursor ? parseInt(query.cursor, 10) : 0;
    const pageSize = 20;

    const { data, total, hasMore } = getContratos(page, pageSize, {
      status: query.status,
      busca: query.busca,
    });

    const metricas = getMetricas();

    return NextResponse.json({
      data,
      nextCursor: hasMore ? (page + 1).toString() : undefined,
      metricas,
      total: total.count,
    });
  } catch (error) {
    console.error('Erro ao processar contratos:', error);

    const isProd = process.env.NODE_ENV === 'production';
    const errorMessage = isProd
      ? 'Erro ao processar contratos'
      : error instanceof Error
        ? error.message
        : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
