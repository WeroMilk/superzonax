'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const DEFAULT_EMAILS = [
  { name: 'EDUARDO PEÑA IBARRA', email: 'estno.60@hotmail.com' },
  { name: 'Manuel Ortiz Paredes', email: 'est6_2017@hotmail.com' },
  { name: 'rafael ivan olivas romero', email: 'olivas.romero@gmail.com' },
  { name: '', email: 'leticia.samudio6312@gmail.com' },
  { name: '', email: 'gs01@msn.com' },
  { name: 'tecnica72sonora', email: 'sectec72sonora@gmail.com' },
  { name: 'Karla Karina Sanchez Aviles', email: 'karlasanz07@hotmail.com' },
  { name: 'teresita sánchez nava', email: 'teresita_sanchez77@hotmail.com' },
  { name: 'Griselda Zaiz', email: 'grizaiz@gmail.com' },
]

interface EmailSelectorProps {
  value: string
  onChange: (emails: string) => void
}

export default function EmailSelector({ value, onChange }: EmailSelectorProps) {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(
    new Set(value ? value.split(',').map(e => e.trim()).filter(Boolean) : [])
  )
  const [customEmail, setCustomEmail] = useState('')

  // Sincronizar cuando cambia el valor externo
  useEffect(() => {
    if (value) {
      const emails = value.split(',').map(e => e.trim()).filter(Boolean)
      setSelectedEmails(new Set(emails))
    } else {
      setSelectedEmails(new Set())
    }
  }, [value])

  const handleToggleEmail = (email: string) => {
    const newSelected = new Set(selectedEmails)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedEmails(newSelected)
    updateEmailList(newSelected)
  }

  const handleAddCustomEmail = () => {
    if (customEmail.trim() && !selectedEmails.has(customEmail.trim())) {
      const newSelected = new Set(selectedEmails)
      newSelected.add(customEmail.trim())
      setSelectedEmails(newSelected)
      updateEmailList(newSelected)
      setCustomEmail('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    const newSelected = new Set(selectedEmails)
    newSelected.delete(email)
    setSelectedEmails(newSelected)
    updateEmailList(newSelected)
  }

  const updateEmailList = (emails: Set<string>) => {
    onChange(Array.from(emails).join(', '))
  }

  const handleSelectAll = () => {
    const allEmails = DEFAULT_EMAILS.map(e => e.email)
    const newSelected = new Set(allEmails)
    setSelectedEmails(newSelected)
    updateEmailList(newSelected)
  }

  const handleDeselectAll = () => {
    setSelectedEmails(new Set())
    onChange('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          Seleccionar correos electrónicos
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Seleccionar todos
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
          >
            Deseleccionar
          </button>
        </div>
      </div>

      {/* Lista de correos predefinidos */}
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
        {DEFAULT_EMAILS.map((contact, index) => {
          const isSelected = selectedEmails.has(contact.email)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary-50 border border-primary-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => handleToggleEmail(contact.email)}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                {contact.name ? (
                  <>
                    <p className="text-xs font-medium text-gray-800 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-600 truncate">{contact.email}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-800 truncate">{contact.email}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Agregar correo personalizado */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Agregar correo adicional (opcional)
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustomEmail()
              }
            }}
            className="input-field flex-1"
            placeholder="correo@ejemplo.com"
          />
          <button
            type="button"
            onClick={handleAddCustomEmail}
            className="btn-primary px-4 text-sm py-2"
            disabled={!customEmail.trim()}
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Correos seleccionados */}
      {selectedEmails.size > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Correos seleccionados ({selectedEmails.size})
          </label>
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-24 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedEmails).map((email) => {
                const contact = DEFAULT_EMAILS.find(e => e.email === email)
                return (
                  <motion.div
                    key={email}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs"
                  >
                    <span className="text-gray-700">
                      {contact?.name ? `${contact.name} <${email}>` : email}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveEmail(email)
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
