'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import '@/styles/calendar.css'
import { getTodayDate, getCurrentMonth, capitalizeFirst } from '@/lib/utils'
import CustomCalendar from './CustomCalendar'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  type?: 'date' | 'month'
  label?: string
  required?: boolean
  className?: string
  openUpward?: boolean
}

export default function DatePicker({
  value,
  onChange,
  type = 'date',
  label,
  required = false,
  className = '',
  openUpward = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const createLocalDate = (dateString: string): Date => {
    if (!dateString || dateString === '') {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    
    const dateParts = dateString.split('-')
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10) - 1
      const day = parseInt(dateParts[2], 10)
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }
      
      return new Date(year, month, day)
    } else if (dateParts.length === 2) {
      const year = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10) - 1
      
      if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
        return new Date(year, month, 1)
      }
    }
    
    const parsed = new Date(dateString)
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
    
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  const getInitialDate = (): Date => {
    if (value && value !== '') {
      return createLocalDate(value)
    }
    const defaultValue = type === 'date' ? getTodayDate() : getCurrentMonth()
    return createLocalDate(defaultValue)
  }

  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialDate())

  useEffect(() => {
    if (value && value !== '') {
      setSelectedDate(createLocalDate(value))
    } else {
      const defaultValue = type === 'date' ? getTodayDate() : getCurrentMonth()
      setSelectedDate(createLocalDate(defaultValue))
    }
  }, [value, type])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDateChange = (date: Date) => {
    // Normalizar la fecha
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    setSelectedDate(normalizedDate)
    if (type === 'date') {
      const dateStr = format(normalizedDate, 'yyyy-MM-dd')
      onChange(dateStr)
    } else {
      const monthStr = format(normalizedDate, 'yyyy-MM')
      onChange(monthStr)
    }
    setIsOpen(false)
  }
  
  useEffect(() => {
    if (!value || value === '') {
      const defaultValue = type === 'date' ? getTodayDate() : getCurrentMonth()
      onChange(defaultValue)
      setSelectedDate(createLocalDate(defaultValue))
    }
  }, [])

  const formatDisplayValue = () => {
    const dateToUse = selectedDate || new Date(type === 'date' ? getTodayDate() : getCurrentMonth())
    if (type === 'month') {
      return capitalizeFirst(format(dateToUse, 'MMMM yyyy', { locale: es }))
    }
    return format(dateToUse, 'dd/MM/yyyy', { locale: es })
  }

  const formatInputValue = () => {
    const dateToUse = selectedDate || new Date(type === 'date' ? getTodayDate() : getCurrentMonth())
    if (type === 'month') {
      return format(dateToUse, 'yyyy-MM')
    }
    return format(dateToUse, 'yyyy-MM-dd')
  }

  const isToday = () => {
    if (!selectedDate || type === 'month') return false
    const today = new Date()
    const selected = new Date(selectedDate)
    return (
      today.getDate() === selected.getDate() &&
      today.getMonth() === selected.getMonth() &&
      today.getFullYear() === selected.getFullYear()
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${className}`}
      ref={containerRef}
    >
      {label && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="block text-xs font-semibold text-gray-700 mb-1"
        >
          {label}
        </motion.label>
      )}
      <div className="relative group">
        <motion.div
          className="relative cursor-pointer flex items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="absolute left-3 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4 sm:w-4 sm:h-4 pointer-events-none z-10 transition-colors duration-300 group-hover:text-primary-600" />
          <input
            type="text"
            value={formatDisplayValue()}
            readOnly
            required={required}
            className="input-field pl-10 sm:pl-9 pr-16 w-full cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            placeholder={type === 'month' ? 'Selecciona mes y año' : 'Selecciona fecha'}
          />
          {isToday() && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-1.5 sm:right-2.5 bg-primary-600 sm:bg-primary-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1 rounded-md pointer-events-none z-10 flex items-center justify-center whitespace-nowrap"
              style={{ 
                lineHeight: '1', 
                top: 'calc(50% - 10px)', 
                transform: 'translateY(-50%)'
              }}
            >
              Hoy
            </motion.span>
          )}
          <input
            type={type}
            value={formatInputValue()}
            onChange={() => {}}
            required={required}
            className="hidden"
            aria-hidden="true"
          />
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-20 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`absolute left-0 z-[60] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-visible ${
                  openUpward ? 'bottom-full mb-4' : 'top-full mt-2'
                }`}
                style={{ 
                  width: openUpward ? '260px' : '280px',
                  maxWidth: 'calc(100vw - 2rem)',
                }}
              >
                <CustomCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  view={type === 'month' ? 'year' : 'month'}
                  className={openUpward ? 'compact' : ''}
                  openUpward={openUpward}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
