import type { Metadata } from 'next'
import './globals.css'
import '../styles/calendar.css'

export const metadata: Metadata = {
  title: 'Sup Zona X',
  description: 'Sistema de gestión para la Supervisión de Zona X de Secundarias Técnicas en Hermosillo, Sonora',
  icons: {
    icon: '/assets/estlogo.png',
    shortcut: '/assets/estlogo.png',
    apple: '/assets/estlogo.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}

