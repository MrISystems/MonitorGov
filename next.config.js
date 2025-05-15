/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Configuração para garantir que todas as rotas sejam geradas
  trailingSlash: false,
  // Configuração para lidar com rotas dinâmicas
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig