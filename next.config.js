/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ⚠️ IMPORTANTE: Export estático para GitHub Pages
  output: 'export',
  // Base path para GitHub Pages (nombre del repositorio)
  basePath: process.env.NODE_ENV === 'production' ? '/supzonax' : '',
  // Trailing slash para compatibilidad con GitHub Pages
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // Necesario para GitHub Pages (no soporta optimización de imágenes)
  },
  // ⚠️ NOTA: Server Actions NO funcionan en export estático
  // Si necesitas API routes, usa Vercel o un backend separado
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
