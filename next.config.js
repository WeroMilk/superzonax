/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO usar 'export' si tienes API Routes
  // output: 'export',  ⬅️ COMENTA o ELIMINA esta línea
  
  images: {
    unoptimized: true,
  },
  // Añade esto para ignorar API Routes en build estático
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig
