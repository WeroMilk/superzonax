'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const logoSize = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  const spinnerSize = {
    sm: 16,
    md: 24,
    lg: 32,
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="relative" style={{ width: sizeClasses[size], height: sizeClasses[size] }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0"
          style={{
            width: sizeClasses[size],
            height: sizeClasses[size],
          }}
        >
          <svg
            width={spinnerSize[size] * 4}
            height={spinnerSize[size] * 4}
            viewBox="0 0 100 100"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#8B1538"
              strokeWidth="3"
              strokeDasharray="20 10"
              strokeLinecap="round"
              opacity="0.3"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#8B1538"
              strokeWidth="3"
              strokeDasharray="20 10"
              strokeLinecap="round"
              strokeDashoffset="30"
              animate={{
                strokeDashoffset: [30, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </motion.div>
        
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0"
          style={{
            width: sizeClasses[size],
            height: sizeClasses[size],
          }}
        >
          <svg
            width={spinnerSize[size] * 3}
            height={spinnerSize[size] * 3}
            viewBox="0 0 100 100"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#a91d47"
              strokeWidth="2.5"
              strokeDasharray="15 8"
              strokeLinecap="round"
              strokeDashoffset="23"
              animate={{
                strokeDashoffset: [23, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: logoLoaded ? 1 : 0, opacity: logoLoaded ? 1 : 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <motion.img
            src="/logo-dgest.png"
            alt="DGEST"
            width={logoSize[size]}
            height={logoSize[size]}
            className="object-contain drop-shadow-lg"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoLoaded(false)}
            animate={{ 
              scale: logoLoaded ? [1, 1.05, 1] : 0,
            }}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
