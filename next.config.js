/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel
  images: {
    unoptimized: true,
  },
  // Si tienes API routes, NO uses 'output: export'
  // Si no tienes API routes, puedes habilitarlo:
  // output: 'export',
  
  // Si tienes problemas con builds, desactiva eslint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
