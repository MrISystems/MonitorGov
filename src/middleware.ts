import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas que requerem autenticação
const PROTECTED_ROUTES = ['/api/contratos', '/api/relatorios'];

// Rotas públicas
const PUBLIC_ROUTES = ['/', '/login', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se é uma rota da API
  const isApiRoute = pathname.startsWith('/api');
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Se não for uma rota da API ou for uma rota pública, permite o acesso
  if (!isApiRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica o token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Se não houver token e a rota for protegida, retorna 401
  if (!token && isProtectedRoute) {
    return new NextResponse(
      JSON.stringify({
        error: 'Não autorizado',
        message: 'Token de autenticação não fornecido',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer',
        },
      }
    );
  }

  // Adiciona headers de segurança
  const response = NextResponse.next();

  // Headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  // Previne cache de respostas sensíveis
  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
