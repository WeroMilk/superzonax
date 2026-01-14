'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Shield, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { handleApiResponse, FetchError } from '@/lib/types'
import type { LoginResponse } from '@/lib/types'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const nextRoot = document.getElementById('__next')
    
    const originalHtmlStyle = {
        margin: html.style.margin,
        padding: html.style.padding,
        overflow: html.style.overflow,
        background: html.style.background,
        backgroundColor: html.style.backgroundColor,
        width: html.style.width,
        height: html.style.height,
      }
      const originalBodyStyle = {
        margin: body.style.margin,
        padding: body.style.padding,
        overflow: body.style.overflow,
        background: body.style.background,
        backgroundColor: body.style.backgroundColor,
        width: body.style.width,
        height: body.style.height,
      }
      const originalNextStyle = nextRoot ? {
        margin: nextRoot.style.margin,
        padding: nextRoot.style.padding,
        overflow: nextRoot.style.overflow,
        background: nextRoot.style.background,
        backgroundColor: nextRoot.style.backgroundColor,
        width: nextRoot.style.width,
        height: nextRoot.style.height,
    } : null
    
    html.style.margin = '0'
      html.style.padding = '0'
      html.style.overflowY = 'auto'
      html.style.overflowX = 'hidden'
      html.style.background = 'linear-gradient(135deg, #6f112c 0%, #8B1538 50%, #530d20 100%)'
      html.style.backgroundColor = '#8B1538'
      html.style.width = '100vw'
      html.style.minHeight = '100vh'
      html.style.boxSizing = 'border-box'
      html.style.WebkitOverflowScrolling = 'touch'
      
      body.style.margin = '0'
      body.style.padding = '0'
      body.style.overflowY = 'auto'
      body.style.overflowX = 'hidden'
      body.style.background = 'linear-gradient(135deg, #6f112c 0%, #8B1538 50%, #530d20 100%)'
      body.style.backgroundColor = '#8B1538'
      body.style.width = '100vw'
      body.style.minHeight = '100vh'
      body.style.boxSizing = 'border-box'
      body.style.WebkitOverflowScrolling = 'touch'
      
      if (nextRoot) {
        nextRoot.style.margin = '0'
        nextRoot.style.padding = '0'
        nextRoot.style.overflow = 'hidden'
        nextRoot.style.background = 'transparent'
        nextRoot.style.backgroundColor = 'transparent'
        nextRoot.style.width = '100vw'
      nextRoot.style.height = '100vh'
    }
    
    return () => {
        html.style.margin = originalHtmlStyle.margin
        html.style.padding = originalHtmlStyle.padding
        html.style.overflow = originalHtmlStyle.overflow
        html.style.background = originalHtmlStyle.background
        html.style.backgroundColor = originalHtmlStyle.backgroundColor
        html.style.width = originalHtmlStyle.width
        html.style.height = originalHtmlStyle.height
        
        body.style.margin = originalBodyStyle.margin
        body.style.padding = originalBodyStyle.padding
        body.style.overflow = originalBodyStyle.overflow
        body.style.background = originalBodyStyle.background
        body.style.backgroundColor = originalBodyStyle.backgroundColor
        body.style.width = originalBodyStyle.width
        body.style.height = originalBodyStyle.height
        
        if (nextRoot && originalNextStyle) {
          nextRoot.style.margin = originalNextStyle.margin
          nextRoot.style.padding = originalNextStyle.padding
          nextRoot.style.overflow = originalNextStyle.overflow
          nextRoot.style.background = originalNextStyle.background
          nextRoot.style.backgroundColor = originalNextStyle.backgroundColor
          nextRoot.style.width = originalNextStyle.width
          nextRoot.style.height = originalNextStyle.height
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api/auth/login`
        : '/api/auth/login'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      const data = await handleApiResponse<LoginResponse>(response)

      if (data.success && data.token) {
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        router.push('/dashboard')
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      if (err instanceof FetchError) {
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
    <div 
      className="login-page-container relative overflow-y-auto" 
      style={{ 
        margin: 0, 
        padding: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        width: '100vw',
        minHeight: '100vh',
        height: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #6f112c 0%, #8B1538 50%, #530d20 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#8B1538',
        zIndex: 0,
        WebkitOverflowScrolling: 'touch',
      }}
      >
      <div
        className="relative flex items-center justify-center w-full min-h-full p-4" 
        style={{ 
          width: '100%', 
          minHeight: '100vh', 
          height: 'auto',
          zIndex: 1, 
          position: 'relative', 
          margin: 0,
          padding: 'clamp(0.5rem, 2vw, 1rem)',
          paddingBottom: 'max(clamp(2rem, 5vh, 4rem), env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 'clamp(10vh, 18vh, 22vh)',
          backgroundColor: 'transparent',
          background: 'linear-gradient(135deg, #6f112c 0%, #8B1538 50%, #530d20 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full mx-auto"
          style={{
            marginTop: 'clamp(-40px, -5vh, -20px)',
            marginBottom: 'auto',
            maxWidth: 'clamp(18rem, 90vw, 24rem)',
            width: '100%',
            paddingLeft: 'clamp(0.5rem, 2vw, 1rem)',
            paddingRight: 'clamp(0.5rem, 2vw, 1rem)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="bg-white rounded-2xl shadow-2xl space-y-6"
            style={{
              padding: 'clamp(1rem, 4vw, 2rem)',
            }}
          >
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
              className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800"
              style={{ wordBreak: 'break-word', hyphens: 'auto' }}
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
                  onChange={(e) => {
                    const value = e.target.value
                    const lowercasedValue = value.length > 0 
                      ? value.charAt(0).toLowerCase() + value.slice(1)
                      : value
                    setUsername(lowercasedValue)
                  }}
                  className="input-field pl-10 bg-gray-50"
                  placeholder="Ingresa tu usuario"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 bg-gray-50"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
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
    </div>
  )
}

