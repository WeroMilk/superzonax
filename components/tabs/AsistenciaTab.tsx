'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Mail, Calendar, Download, Trash2, Save } from 'lucide-react'
import { formatDate, getTodayDate, getFileUrl } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'
import EmailSelector from '@/components/EmailSelector'
import { generateAttendanceExcel, workbookToBlob, AttendanceSchoolData } from '@/lib/excel-generator'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface AttendanceRecord {
  id: number
  school_id: string
  date: string
  students_file: string
  staff_file: string
  created_at: string
}

export default function AsistenciaTab({ user }: { user: User }) {
  const [date, setDate] = useState(getTodayDate())
  const [turno, setTurno] = useState('Turno Matutino')
  const [schools, setSchools] = useState<AttendanceSchoolData[]>([
    { ct: '', totalAlumnos: 0, totalMaestros: 0, asistenciaMaestros: 0, asistenciaAlumnos: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [lastUploaded, setLastUploaded] = useState<AttendanceRecord | null>(null)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)

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
      const storageKey = `lastUploaded_attendance_${user.role}`
      localStorage.setItem(storageKey, JSON.stringify(lastUploaded))
    }
  }, [lastUploaded, isAdmin, user.role])

  const loadLastUploaded = async () => {
    const storageKey = `lastUploaded_attendance_${user.role}`
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
      const response = await fetch(`/api/attendance?school=${schoolId}`)
      const data = await response.json()
      if (data.success && data.records.length > 0) {
        const sortedRecords = data.records.sort((a: AttendanceRecord, b: AttendanceRecord) => {
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
      const response = await fetch('/api/attendance')
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
      const response = await fetch(`/api/attendance/${recordId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Registro eliminado correctamente' })
        const storageKey = `lastUploaded_attendance_${user.role}`
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

  const removeSchool = (index: number) => {
    if (schools.length > 1) {
      setSchools(schools.filter((_, i) => i !== index))
    }
  }

  const updateSchool = (index: number, field: keyof AttendanceSchoolData, value: string | number) => {
    const updated = [...schools]
    updated[index] = { ...updated[index], [field]: value }
    setSchools(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que todos los campos estén llenos
    const hasEmptyFields = schools.some(school => 
      !school.ct || 
      school.totalAlumnos <= 0 || 
      school.totalMaestros <= 0 || 
      school.asistenciaMaestros < 0 || 
      school.asistenciaAlumnos < 0
    )

    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos de todas las escuelas' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Generar el archivo Excel
      const workbook = generateAttendanceExcel({ date, turno, schools })
      const blob = workbookToBlob(workbook)
      
      // Convertir blob a ArrayBuffer para asegurar que se envíe correctamente
      const arrayBuffer = await blob.arrayBuffer()
      const file = new File([arrayBuffer], `asistencia_${date}.xlsx`, { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })

      // Subir el archivo generado
      const formData = new FormData()
      formData.append('date', date)
      formData.append('attendanceFile', file)

      const response = await fetch('/api/attendance', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Descargar el archivo Excel generado automáticamente
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `asistencia_${date}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        // Actualizar el último archivo subido
        await fetchLastRecord()
        
        setMessage({ type: 'success', text: 'Asistencia guardada correctamente. El archivo Excel se ha generado y descargado automáticamente.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar asistencia' })
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
      const response = await fetch('/api/attendance/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
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
            <span>Asistencia Diaria - Administración</span>
          </h2>

          <div className="space-y-2">
            <DatePicker
              value={date}
              onChange={setDate}
              type="date"
              label="Seleccionar Fecha"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['sec6', 'sec60', 'sec72'].map((school) => {
                const schoolRecords = records.filter((r) => r.school_id === school && r.date === date)
                return (
                  <div key={school} className="card-compact">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      {school === 'sec6' ? 'Secundaria 6' : school === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'}
                    </h3>
                    {schoolRecords.length > 0 && schoolRecords[0].students_file ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          ✓ Archivo subido
                        </p>
                        <a
                          href={getFileUrl(schoolRecords[0].students_file)}
                          download={schoolRecords[0].students_file?.split('/').pop() || 'archivo.xlsx'}
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar archivo</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sin archivo para esta fecha</p>
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
                <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{formatDate(record.date)}</p>
                    <p className="text-xs text-gray-600">
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
              <h3 className="text-lg font-bold mb-3">Enviar Asistencia por Correo</h3>
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
    <div 
      className="h-full flex flex-col space-y-3" 
      style={{ 
        height: '100%',
        maxHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        minHeight: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex-shrink-0 p-3 sm:p-4"
        style={{ minHeight: 'fit-content' }}
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-primary-500" />
          <span>Subir Asistencia Diaria</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <DatePicker
                value={date}
                onChange={setDate}
                type="date"
                label="Fecha"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Turno
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="input-field w-full text-sm"
                required
              >
                <option value="Turno Matutino">Turno Matutino</option>
                <option value="Turno Vespertino">Turno Vespertino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Datos de Escuela
            </label>
            <div className="space-y-2.5">
              {schools.map((school, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-compact p-2.5 border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Secundaria Técnica</h4>
                    {schools.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchool(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          CT (Clave de Trabajo)
                        </label>
                        <input
                          type="text"
                          value={school.ct}
                          onChange={(e) => updateSchool(index, 'ct', e.target.value.toUpperCase())}
                          className="input-field w-full text-sm"
                          placeholder="Ej: 26DST0072J"
                          required
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>
                      <div></div>
                      <div></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Total Alumnos
                        </label>
                        <input
                          type="number"
                          value={school.totalAlumnos || ''}
                          onChange={(e) => updateSchool(index, 'totalAlumnos', parseInt(e.target.value) || 0)}
                          className="input-field w-full text-sm"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Asistencia Alumnos
                        </label>
                        <input
                          type="number"
                          value={school.asistenciaAlumnos || ''}
                          onChange={(e) => updateSchool(index, 'asistenciaAlumnos', parseInt(e.target.value) || 0)}
                          className="input-field w-full text-sm"
                          min="0"
                          max={school.totalAlumnos}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Total Maestros
                        </label>
                        <input
                          type="number"
                          value={school.totalMaestros || ''}
                          onChange={(e) => updateSchool(index, 'totalMaestros', parseInt(e.target.value) || 0)}
                          className="input-field w-full text-sm"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Asistencia Maestros
                        </label>
                        <input
                          type="number"
                          value={school.asistenciaMaestros || ''}
                          onChange={(e) => updateSchool(index, 'asistenciaMaestros', parseInt(e.target.value) || 0)}
                          className="input-field w-full text-sm"
                          min="0"
                          max={school.totalMaestros}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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

          <button type="submit" className="btn-primary text-sm py-2 px-4 flex items-center justify-center space-x-2 mx-auto" disabled={loading}>
            {loading ? (
              <>
                <span>Generando archivo...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Asistencia y Generar Excel</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Último Archivo Subido */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card flex flex-col flex-shrink-0 p-3"
          style={{ maxHeight: '250px', display: 'flex', flexDirection: 'column' }}
        >
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 flex-shrink-0">Último Archivo Subido</h3>
          <div 
            className="flex-1 flex items-center justify-center"
            style={{ 
              overflowY: 'auto', 
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              maxHeight: '100%',
              minHeight: 0
            }}
          >
            {!lastUploaded ? (
              <p className="text-gray-500 text-center text-sm py-3">No hay archivos subidos aún</p>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-3 p-3">
                <div className="flex flex-col items-center space-y-1">
                  <p className="font-medium text-base">{formatDate(lastUploaded.date)}</p>
                  <p className="text-sm text-gray-600">
                    {lastUploaded.students_file ? 'Archivo subido' : 'Sin archivo'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {lastUploaded.students_file && (
                    <a
                      href={getFileUrl(lastUploaded.students_file)}
                      download={lastUploaded.students_file?.split('/').pop() || 'archivo.xlsx'}
                      className="btn-primary flex items-center space-x-2 px-3 py-1.5 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteRecord(lastUploaded.id)}
                    className="btn-secondary flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 border-red-500"
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

