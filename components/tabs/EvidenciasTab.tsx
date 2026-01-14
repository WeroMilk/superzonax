'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  X,
  Search,
  Filter,
  Grid3x3,
  List,
  Eye,
  Calendar,
  Building2,
  FileImage,
  ZoomIn,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { formatDateTime, formatDateTimeCompact } from '@/lib/utils'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface Evidencia {
  id: number
  school_id: string
  title: string
  description: string
  file_paths: string[]
  file_types: string[]
  created_at: string
  file_path?: string
  file_type?: string
}

type ViewMode = 'grid' | 'list'

export default function EvidenciasTab({ user }: { user: User }) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedImage, setSelectedImage] = useState<{ evidencia: Evidencia; index: number } | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const isAdmin = user.role === 'admin'
  const schoolId = user.role

  useEffect(() => {
    fetchEvidencias()
  }, [])

  const fetchEvidencias = async () => {
    try {
      const response = await fetch(isAdmin ? '/api/evidencias' : `/api/evidencias?school=${schoolId}`)
      const data = await response.json()
      if (data.success) {
        setEvidencias(data.evidencias.sort((a: Evidencia, b: Evidencia) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching evidencias:', error)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const currentCount = files.length
      const remainingSlots = 10 - currentCount
      
      if (remainingSlots <= 0) {
        setMessage({ type: 'error', text: 'Has alcanzado el límite de 10 fotos por evidencia' })
        return
      }
      
      const filesToAdd = acceptedFiles.slice(0, remainingSlots)
      const newFiles = [...files, ...filesToAdd]
      
      if (acceptedFiles.length > remainingSlots) {
        setMessage({ type: 'error', text: `Solo se pueden agregar ${remainingSlots} foto(s) más. Límite de 10 fotos por evidencia.` })
      }
      
      setFiles(newFiles)
      
      // Crear previews de las nuevas imágenes
      const newPreviews: string[] = []
      filesToAdd.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === filesToAdd.length) {
            setPreviewImages([...previewImages, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    maxFiles: 10,
    disabled: previewImages.length >= 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0 || !title) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos y selecciona al menos una imagen' })
      return
    }
    
    if (files.length > 10) {
      setMessage({ type: 'error', text: 'El límite es de 10 fotos por evidencia' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/evidencias', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Evidencia subida correctamente' })
        setFiles([])
        setTitle('')
        setDescription('')
        setPreviewImages([])
        setShowUploadModal(false)
        fetchEvidencias()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir evidencia' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return

    try {
      const response = await fetch(`/api/evidencias/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        fetchEvidencias()
      }
    } catch (error) {
      console.error('Error deleting evidencia:', error)
    }
  }

  const filteredEvidencias = evidencias.filter((evidencia) => {
    const matchesSearch = evidencia.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidencia.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterSchool === 'all' || evidencia.school_id === filterSchool
    return matchesSearch && matchesFilter
  })

  const getSchoolName = (schoolId: string) => {
    return schoolId === 'sec6' ? 'Secundaria 6' : 
           schoolId === 'sec60' ? 'Secundaria 60' : 
           'Secundaria 72'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Galería de Evidencias</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Documentación visual de actividades institucionales</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isAdmin && (
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Evidencia</span>
              </button>
            )}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de cuadrícula"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar evidencias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          {isAdmin && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="all">Todas las escuelas</option>
                <option value="sec6">Secundaria 6</option>
                <option value="sec60">Secundaria 60</option>
                <option value="sec72">Secundaria 72</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredEvidencias.length === 0 ? (
          <div className="text-center py-12">
            <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No se encontraron evidencias</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || filterSchool !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'No hay evidencias registradas aún'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvidencias.map((evidencia) => {
              const filePaths = evidencia.file_paths || (evidencia.file_path ? [evidencia.file_path] : [])
              const mainImage = filePaths[0]
              
              return (
                <motion.div
                  key={evidencia.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div 
                    className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage({ evidencia, index: 0 })}
                  >
                    <img
                      src={`/api/files/${mainImage}`}
                      alt={evidencia.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    {filePaths.length > 1 && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>+{filePaths.length - 1}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{evidencia.title}</h3>
                    {evidencia.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{evidencia.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDateTimeCompact(evidencia.created_at)}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span className="font-semibold">{getSchoolName(evidencia.school_id)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(evidencia.id)}
                      className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvidencias.map((evidencia) => {
              const filePaths = evidencia.file_paths || (evidencia.file_path ? [evidencia.file_path] : [])
              const mainImage = filePaths[0]
              
              return (
                <motion.div
                  key={evidencia.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div 
                      className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 relative overflow-hidden cursor-pointer flex-shrink-0"
                      onClick={() => setSelectedImage({ evidencia, index: 0 })}
                    >
                      <img
                        src={`/api/files/${mainImage}`}
                        alt={evidencia.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      {filePaths.length > 1 && (
                        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          +{filePaths.length - 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{evidencia.title}</h3>
                        {evidencia.description && (
                          <p className="text-sm text-gray-600 mb-3">{evidencia.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTimeCompact(evidencia.created_at)}</span>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4" />
                              <span className="font-semibold">{getSchoolName(evidencia.school_id)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>{filePaths.length} {filePaths.length === 1 ? 'imagen' : 'imágenes'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 mt-3">
                        <button
                          onClick={() => setSelectedImage({ evidencia, index: 0 })}
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver galería</span>
                        </button>
                        <button
                          onClick={() => handleDelete(evidencia.id)}
                          className="ml-auto flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de subida */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="bg-primary-500 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Subir Nueva Evidencia</h3>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setFiles([])
                      setTitle('')
                      setDescription('')
                      setPreviewImages([])
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título de la Evidencia *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      required
                      placeholder="Ej: Actividad del Día de la Independencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Descripción de la evidencia..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Imágenes * {previewImages.length > 0 && (
                        <span className="text-xs font-normal text-gray-500">
                          ({previewImages.length}/10)
                        </span>
                      )}
                    </label>
                    {previewImages.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {previewImages.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = files.filter((_, i) => i !== index)
                                  const newPreviews = previewImages.filter((_, i) => i !== index)
                                  setFiles(newFiles)
                                  setPreviewImages(newPreviews)
                                  setMessage(null)
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar esta foto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {/* Botón para agregar más si hay menos de 10 fotos */}
                          {previewImages.length < 10 && (
                            <div
                              {...dropzone.getRootProps()}
                              className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                dropzone.isDragActive
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-300 hover:border-primary-400 bg-gray-50'
                              }`}
                            >
                              <input {...dropzone.getInputProps()} />
                              <Upload className="w-6 h-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-600 text-center px-2">
                                Agregar más
                              </p>
                            </div>
                          )}
                        </div>
                        {previewImages.length >= 10 && (
                          <p className="text-xs text-gray-500 text-center">
                            Has alcanzado el límite de 10 fotos por evidencia
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFiles([])
                            setPreviewImages([])
                            setMessage(null)
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Eliminar todas las imágenes
                        </button>
                      </div>
                    ) : (
                      <div
                        {...dropzone.getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          dropzone.isDragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400'
                        }`}
                      >
                        <input {...dropzone.getInputProps()} />
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 font-medium mb-1">
                          Arrastra las imágenes aquí o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-gray-500">
                          Puedes seleccionar múltiples imágenes (JPG, PNG, GIF, WEBP). Máximo 10 fotos por evidencia.
                        </p>
                      </div>
                    )}
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm flex items-center space-x-2 ${
                        message.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      <span>{message.text}</span>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false)
                        setFiles([])
                        setTitle('')
                        setDescription('')
                        setPreviewImages([])
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                      {loading ? 'Subiendo...' : 'Subir Evidencia'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de visualización de imágenes */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-6xl w-full max-h-[90vh] flex flex-col"
              >
                <div className="bg-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                  <h3 className="font-bold text-gray-900">{selectedImage.evidencia.title}</h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="bg-black flex-1 overflow-hidden relative">
                  {(() => {
                    const filePaths = selectedImage.evidencia.file_paths || 
                      (selectedImage.evidencia.file_path ? [selectedImage.evidencia.file_path] : [])
                    const currentImage = filePaths[selectedImage.index]
                    
                    return (
                      <>
                        <img
                          src={`/api/files/${currentImage}`}
                          alt={selectedImage.evidencia.title}
                          className="w-full h-full object-contain"
                        />
                        {filePaths.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage({
                                  evidencia: selectedImage.evidencia,
                                  index: selectedImage.index > 0 
                                    ? selectedImage.index - 1 
                                    : filePaths.length - 1
                                })
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                              aria-label="Imagen anterior"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-800" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage({
                                  evidencia: selectedImage.evidencia,
                                  index: selectedImage.index < filePaths.length - 1 
                                    ? selectedImage.index + 1 
                                    : 0
                                })
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                              aria-label="Imagen siguiente"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-800" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                              {selectedImage.index + 1} / {filePaths.length}
                            </div>
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
