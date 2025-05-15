/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Configuração para garantir que todas as rotas sejam geradas
  trailingSlash: false,
  // Configurações otimizadas
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig