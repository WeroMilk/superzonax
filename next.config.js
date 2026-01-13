/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración para Vercel (permite API routes y Server Actions)
  images: {
    domains: ['localhost'],
    // Vercel soporta optimización de imágenes, así que podemos habilitarla
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
