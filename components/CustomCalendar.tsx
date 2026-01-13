'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { capitalizeFirst } from '@/lib/utils'

interface CustomCalendarProps {
  value: Date | null
  onChange: (date: Date) => void
  view?: 'month' | 'year'
  className?: string
  openUpward?: boolean
}

export default function CustomCalendar({
  value,
  onChange,
  view = 'month',
  className = '',
  openUpward = false,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(value || new Date())
  const [currentView, setCurrentView] = useState<'month' | 'year'>(view)

  // Sincronizar currentDate cuando cambie value
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value.getFullYear(), value.getMonth(), 1))
    }
  }, [value])

  // Sincronizar currentView cuando cambie view
  useEffect(() => {
    setCurrentView(view)
  }, [view])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calcular el primer día del mes (0=domingo, 1=lunes, ..., 6=sábado)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  // Calcular el número de días en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Días de la semana en español
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  // Meses en español
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Generar array de días del mes
  const days: (number | null)[] = []
  
  // Agregar días vacíos al inicio para alinear el primer día del mes
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Agregar los días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day)
    onChange(newDate)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handlePrevYear = () => {
    setCurrentDate(new Date(year - 1, month, 1))
  }

  const handleNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1))
  }

  const isToday = (day: number): boolean => {
    if (!value) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number): boolean => {
    if (!value) return false
    return (
      day === value.getDate() &&
      month === value.getMonth() &&
      year === value.getFullYear()
    )
  }

  const handleMonthClick = (selectedMonth: number) => {
    setCurrentDate(new Date(year, selectedMonth, 1))
    setCurrentView('month')
  }

  if (currentView === 'year') {
    return (
      <div className={`custom-calendar ${className} ${openUpward ? 'compact' : ''} year-view-calendar`}>
        <div className="react-calendar__navigation">
          <button
            onClick={handlePrevYear}
            className="react-calendar__navigation__arrow react-calendar__navigation__prev-button"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="react-calendar__navigation__label">
            <span>{year}</span>
          </div>
          <button
            onClick={handleNextYear}
            className="react-calendar__navigation__arrow react-calendar__navigation__next-button"
            type="button"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="react-calendar__year-view__months">
          {months.map((monthName, index) => (
            <button
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`react-calendar__year-view__months__month ${
                month === index ? 'react-calendar__year-view__months__month--active' : ''
              }`}
              type="button"
            >
              {monthName}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`custom-calendar ${className} ${openUpward ? 'compact' : ''}`}>
      {/* Navegación */}
      <div className="react-calendar__navigation">
        <button
          onClick={handlePrevMonth}
          className="react-calendar__navigation__arrow react-calendar__navigation__prev-button"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <div className="react-calendar__navigation__label">
          <span>{capitalizeFirst(format(currentDate, 'MMMM yyyy', { locale: es }))}</span>
        </div>
        <button
          onClick={handleNextMonth}
          className="react-calendar__navigation__arrow react-calendar__navigation__next-button"
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="react-calendar__month-view__weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="react-calendar__month-view__weekdays__weekday">
            <abbr title={day}>{day}</abbr>
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="react-calendar__month-view__days">
        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="react-calendar__tile react-calendar__tile--neighboringMonth"
                style={{ visibility: 'hidden' }}
              />
            )
          }

          const isTodayDay = isToday(day)
          const isSelectedDay = isSelected(day)

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDateClick(day)}
              className={`custom-calendar-tile react-calendar__tile ${
                isTodayDay ? 'today' : ''
              } ${isSelectedDay ? 'selected' : ''}`}
              type="button"
            >
              <abbr>{day}</abbr>
            </button>
          )
        })}
      </div>
    </div>
  )
}
