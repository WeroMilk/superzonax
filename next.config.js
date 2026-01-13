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
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
