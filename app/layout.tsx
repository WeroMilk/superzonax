import type { Metadata } from 'next'
import './globals.css'
import '../styles/calendar.css'

export const metadata: Metadata = {
  title: 'Supervisión de Zona X - Secundarias Técnicas',
  description: 'Sistema de gestión para la Supervisión de Zona X de Secundarias Técnicas en Hermosillo, Sonora',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

