'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Shield } from 'lucide-react'
import Image from 'next/image'
import { handleApiResponse, FetchError } from '@/lib/types'
import type { LoginResponse } from '@/lib/types'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await handleApiResponse<LoginResponse>(response)

      if (data.success && data.token) {
        // Guardar token en cookie (backup, aunque el servidor ya lo estableció)
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        router.push('/dashboard')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error de login:', err)
      
      if (err instanceof FetchError) {
        // Manejar errores HTTP específicos
        switch (err.status) {
          case 400:
            setError('Por favor completa todos los campos')
            break
          case 401:
            setError('Usuario o contraseña incorrectos')
            break
          case 405:
            setError('Método no permitido. Por favor recarga la página.')
            break
          case 500:
            setError('Error del servidor. Por favor intenta más tarde.')
            break
          default:
            setError(err.data?.error || `Error ${err.status}: ${err.statusText}`)
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Error de conexión. Por favor verifica tu conexión a internet.')
      } else {
        setError('Error desconocido. Por favor intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {/* Logo y título */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mx-auto flex items-center justify-center"
            >
              <Image
                src="/logo-dgest.png"
                alt="DGEST Zona 10"
                width={128}
                height={128}
                className="object-contain"
                priority
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap"
            >
              Supervisión de Zona X
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Secundarias Técnicas - Hermosillo, Sonora
            </motion.p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10 bg-gray-50"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 bg-gray-50"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </motion.button>
          </form>

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200"
          >
            <p>Gobierno del Estado de Sonora</p>
            <p className="mt-1">Secretaría de Educación y Cultura</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

