'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Mail, Calendar, Download, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { formatDate, getCurrentYear, getFileUrl } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'
import EmailSelector from '@/components/EmailSelector'
import YearInput from '@/components/YearInput'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface TrimestralRecord {
  id: number
  school_id: string
  quarter: number
  year: number
  file: string
  created_at: string
}

export default function ReporteTrimestralTab({ user }: { user: User }) {
  const [quarter, setQuarter] = useState(1)
  const [year, setYear] = useState(getCurrentYear())
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [records, setRecords] = useState<TrimestralRecord[]>([])
  const [lastUploaded, setLastUploaded] = useState<TrimestralRecord | null>(null)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  const isAdmin = user.role === 'admin'
  const schoolId = isAdmin ? null : user.role

  useEffect(() => {
    if (isAdmin) {
      fetchRecords()
    } else {
      loadLastUploaded()
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin && lastUploaded) {
      const storageKey = `lastUploaded_trimestral_${user.role}`
      localStorage.setItem(storageKey, JSON.stringify(lastUploaded))
    }
  }, [lastUploaded, isAdmin, user.role])

  const loadLastUploaded = async () => {
    const storageKey = `lastUploaded_trimestral_${user.role}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setLastUploaded(parsed)
      } catch {
        // Error al parsear, continuar sin datos guardados
      }
    }
    await fetchLastRecord()
  }

  const fetchLastRecord = async () => {
    try {
      const response = await fetch(`/api/reporte-trimestral?school=${schoolId}`)
      const data = await response.json()
      if (data.success && data.records.length > 0) {
        const sortedRecords = data.records.sort((a: TrimestralRecord, b: TrimestralRecord) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        const latest = sortedRecords[0]
        setLastUploaded(latest)
      }
    } catch {
      // Error al obtener registros
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/reporte-trimestral')
      const data = await response.json()
      if (data.success) {
        setRecords(data.records)
      }
    } catch {
      // Error al obtener registros
    }
  }


  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      return
    }

    try {
      const response = await fetch(`/api/reporte-trimestral/${recordId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Registro eliminado correctamente' })
        const storageKey = `lastUploaded_trimestral_${user.role}`
        localStorage.removeItem(storageKey)
        setLastUploaded(null)
        await fetchLastRecord()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al eliminar registro' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage({ type: 'error', text: 'Por favor sube un archivo' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('quarter', quarter.toString())
    formData.append('year', year.toString())
    formData.append('file', file)

    try {
      const response = await fetch('/api/reporte-trimestral', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Reporte subido correctamente' })
        setFile(null)
        await fetchLastRecord()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir reporte' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      setMessage({ type: 'error', text: 'Ingresa al menos un correo electrónico' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reporte-trimestral/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quarter: selectedQuarter,
          year: selectedYear,
          recipients: emailRecipients.split(',').map((e) => e.trim()),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Correo enviado correctamente' })
        setShowEmailModal(false)
        setEmailRecipients('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al enviar correo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  if (isAdmin) {
    return (
      <div className="h-full flex flex-col space-y-2 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex-shrink-0"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span>Reporte Trimestral - Administración</span>
          </h2>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trimestre
                </label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={1}>Primer Trimestre</option>
                  <option value={2}>Segundo Trimestre</option>
                  <option value={3}>Tercer Trimestre</option>
                  <option value={4}>Cuarto Trimestre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Año
                </label>
                <YearInput
                  value={selectedYear}
                  onChange={setSelectedYear}
                  min={2020}
                  max={2100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['sec6', 'sec60', 'sec72'].map((school) => {
                const schoolRecords = records.filter(
                  (r) => r.school_id === school && r.quarter === selectedQuarter && r.year === selectedYear
                )
                return (
                  <div key={school} className="card-compact">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      {school === 'sec6' ? 'Secundaria 6' : school === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'}
                    </h3>
                    {schoolRecords.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">✓ Reporte subido</p>
                        <a
                          href={getFileUrl(schoolRecords[0].file)}
                          download
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sin reporte para este trimestre</p>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setShowEmailModal(true)}
              className="btn-primary w-full md:w-auto text-sm py-2 px-4"
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Enviar por Correo
            </button>
          </div>
        </motion.div>

        {/* Historial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card flex-1 overflow-hidden flex flex-col"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex-shrink-0">Historial</h3>
          <div className="space-y-1 overflow-y-auto flex-1">
            {records.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay documentos aún.</p>
            ) : (
              records.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      Trimestre {record.quarter} - {record.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.school_id === 'sec6' ? 'Secundaria 6' : record.school_id === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Modal de correo */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-4 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold mb-3">Enviar Reporte Trimestral por Correo</h3>
              <div className="space-y-3">
                <EmailSelector
                  value={emailRecipients}
                  onChange={setEmailRecipients}
                />
                <div className="flex space-x-2">
                  <button onClick={handleSendEmail} className="btn-primary flex-1 text-sm py-2" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailModal(false)
                      setEmailRecipients('')
                    }}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-2 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex-shrink-0"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-primary-500" />
          <span>Subir Reporte Trimestral</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Trimestre
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(parseInt(e.target.value))}
                className="input-field"
                required
              >
                <option value={1}>Primer Trimestre</option>
                <option value={2}>Segundo Trimestre</option>
                <option value={3}>Tercer Trimestre</option>
                <option value={4}>Cuarto Trimestre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Año
              </label>
              <YearInput
                value={year}
                onChange={setYear}
                min={2020}
                max={2100}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Archivo del Reporte (PDF o Word)
            </label>
            <div
              {...dropzone.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                dropzone.isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...dropzone.getInputProps()} />
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              {file ? (
                <p className="text-primary-600 font-medium text-sm">{file.name}</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1 text-xs">
                    Arrastra el archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">Solo archivos PDF o Word (.pdf, .doc, .docx)</p>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-2 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary w-full text-sm py-2" disabled={loading}>
            {loading ? 'Subiendo...' : 'Subir Reporte'}
          </button>
        </form>
      </motion.div>

      {/* Último Archivo Subido */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card flex flex-col"
          style={{ height: '450px', display: 'flex', flexDirection: 'column' }}
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex-shrink-0">Último Archivo Subido</h3>
          <div 
            className="flex-1 pr-2 flex items-center justify-center"
            style={{ 
              overflowY: 'auto', 
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              maxHeight: '100%',
              minHeight: 0
            }}
          >
            {!lastUploaded ? (
              <p className="text-gray-500 text-center py-4">No hay archivos subidos aún</p>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-4 p-4">
                <div className="flex flex-col items-center space-y-2">
                  <p className="font-medium text-lg">
                    Trimestre {lastUploaded.quarter} - {lastUploaded.year}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={getFileUrl(lastUploaded.file)}
                    download={lastUploaded.file}
                    className="btn-primary flex items-center space-x-2 px-4 py-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo</span>
                  </a>
                  <button
                    onClick={() => handleDeleteRecord(lastUploaded.id)}
                    className="btn-secondary flex items-center space-x-2 px-4 py-2 text-red-600 border-red-500"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

