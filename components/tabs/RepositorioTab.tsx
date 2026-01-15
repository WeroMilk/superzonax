'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FolderOpen, Download, Trash2, FileText, RefreshCw } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { formatDateTime, getFileUrl } from '@/lib/utils'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface Documento {
  id: number
  title: string
  description: string
  file_path: string
  file_type: string
  uploaded_by: string
  allowed_schools: string[]
  created_at: string
}

export default function RepositorioTab({ user }: { user: User }) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowedSchools, setAllowedSchools] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const isAdmin = user.role === 'admin'

  useEffect(() => {
    fetchDocumentos()
  }, [])

  const fetchDocumentos = async () => {
    try {
      const response = await fetch('/api/documentos')
      const data = await response.json()
      if (data.success) {
        setDocumentos((data.documentos || []).sort((a: Documento, b: Documento) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      } else {
        console.error('Error al obtener documentos:', data.error)
        setMessage({ type: 'error', text: data.error || 'Error al cargar documentos' })
      }
    } catch (error) {
      console.error('Error fetching documentos:', error)
      setMessage({ type: 'error', text: 'Error de conexión al cargar documentos' })
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }

  const dropzone = useDropzone({
    onDrop,
    multiple: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('file', file)
    formData.append('allowed_schools', allowedSchools.join(','))

    try {
      const response = await fetch('/api/documentos', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Documento subido correctamente' })
        setFile(null)
        setTitle('')
        setDescription('')
        setAllowedSchools([])
        setShowUploadModal(false)
        fetchDocumentos()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir documento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return

    try {
      const response = await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Documento eliminado correctamente' })
        fetchDocumentos()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al eliminar documento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al eliminar documento' })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('doc')) return '📝'
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊'
    return '📎'
  }

  return (
    <div className="h-full flex flex-col space-y-2 overflow-hidden">
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end flex-shrink-0"
        >
          <button 
            onClick={() => setShowUploadModal(true)} 
            className="btn-primary flex items-center justify-center space-x-1.5 whitespace-nowrap text-xs py-1.5 px-3 mt-4 mb-2 mr-2"
          >
            <Upload className="w-3 h-3" />
            <span>Subir Documento</span>
          </button>
        </motion.div>
      )}

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex-1 overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-primary-500" />
            <span>Repositorio de Documentos</span>
          </h2>
          <button
            onClick={fetchDocumentos}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar documentos"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {documentos.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">No hay documentos aún</p>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {documentos.map((documento) => (
              <motion.div
                key={documento.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="text-xl flex-shrink-0">{getFileIcon(documento.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary-600 text-sm truncate">{documento.title}</h3>
                    {documento.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{documento.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(documento.created_at)}
                    </p>
                    {isAdmin && documento.allowed_schools && documento.allowed_schools.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Visible para: {documento.allowed_schools.map(s => 
                          s === 'sec6' ? 'Sec. 6' : s === 'sec60' ? 'Sec. 60' : 'Sec. 72'
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <a
                    href={getFileUrl(documento.file_path)}
                    download
                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(documento.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Subir Documento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Archivo
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
                      <p className="text-xs text-gray-500">Cualquier tipo de archivo</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Escuelas que pueden ver este documento (dejar vacío para todas)
                </label>
                <div className="space-y-2">
                  {['sec6', 'sec60', 'sec72'].map((school) => (
                    <label key={school} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowedSchools.includes(school)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedSchools([...allowedSchools, school])
                          } else {
                            setAllowedSchools(allowedSchools.filter(s => s !== school))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {school === 'sec6' ? 'Secundaria 6' : school === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Si no seleccionas ninguna, todas las escuelas podrán ver este documento
                </p>
              </div>

              {message && (
                <div
                  className={`p-2 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex-1 text-sm py-2" disabled={loading}>
                  {loading ? 'Subiendo...' : 'Subir'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setFile(null)
                    setTitle('')
                    setDescription('')
                    setAllowedSchools([])
                  }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

