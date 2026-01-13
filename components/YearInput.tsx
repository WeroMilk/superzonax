'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface YearInputProps {
  value: number
  onChange: (year: number) => void
  min?: number
  max?: number
  className?: string
  required?: boolean
}

export default function YearInput({
  value,
  onChange,
  min = 2020,
  max = 2100,
  className = '',
  required = false,
}: YearInputProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const isDecreaseDisabled = value <= min
  const isIncreaseDisabled = value >= max

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Botón izquierda (decrementar) */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        className={`
          absolute left-2 z-10 p-1.5 rounded-md transition-all duration-200
          ${isDecreaseDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-primary-100 active:bg-primary-200 cursor-pointer'
          }
        `}
        aria-label="Año anterior"
      >
        <ChevronLeft 
          className={`
            w-4 h-4 sm:w-5 sm:h-5
            ${isDecreaseDisabled ? 'text-gray-400' : 'text-primary-600'}
            transition-colors duration-200
          `}
          strokeWidth={2.5}
        />
      </button>

      {/* Input */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        required={required}
        className="input-field text-center pl-10 pr-10 font-semibold text-gray-900"
        style={{ 
          paddingLeft: '2.5rem',
          paddingRight: '2.5rem',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield'
        }}
      />

      {/* Botón derecha (incrementar) */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        className={`
          absolute right-2 z-10 p-1.5 rounded-md transition-all duration-200
          ${isIncreaseDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-primary-100 active:bg-primary-200 cursor-pointer'
          }
        `}
        aria-label="Año siguiente"
      >
        <ChevronRight 
          className={`
            w-4 h-4 sm:w-5 sm:h-5
            ${isIncreaseDisabled ? 'text-gray-400' : 'text-primary-600'}
            transition-colors duration-200
          `}
          strokeWidth={2.5}
        />
      </button>

    </div>
  )
}
