'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  AlertCircle, 
  BookOpen, 
  Flag, 
  Image as ImageIcon,
  X,
  Clock,
  MapPin,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  List
} from 'lucide-react'
import { formatDate, getTodayDate } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'
import { useDropzone } from 'react-dropzone'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface Event {
  id: number
  title: string
  description: string
  event_type: 'evento' | 'asuelto' | 'consejo_tecnico' | 'suspension' | 'conmemoracion'
  start_date: string
  end_date: string | null
  school_id: string | null
  created_by: string
  image_path?: string | null
}

const eventTypeIcons = {
  evento: Bell,
  asuelto: Calendar,
  consejo_tecnico: BookOpen,
  suspension: AlertCircle,
  conmemoracion: Flag,
}

const eventTypeColors = {
  evento: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-700',
    badge: 'bg-primary-100 text-primary-700 border-primary-300',
    icon: 'text-primary-600',
  },
  asuelto: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700 border-green-300',
    icon: 'text-green-600',
  },
  consejo_tecnico: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: 'text-purple-600',
  },
  suspension: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-300',
    icon: 'text-red-600',
  },
  conmemoracion: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: 'text-yellow-600',
  },
}

const eventTypeLabels = {
  evento: 'Evento',
  asuelto: 'Asueto',
  consejo_tecnico: 'Consejo Técnico',
  suspension: 'Suspensión',
  conmemoracion: 'Conmemoración',
}

export default function EventosTab({ user }: { user: User }) {
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'evento' as Event['event_type'],
    start_date: getTodayDate(),
    end_date: '',
    school_id: user.role === 'admin' ? '' : user.role,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const imageDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    multiple: false,
  })

  const isAdmin = user.role === 'admin'

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      if (data.success) {
        let filteredEvents = data.events
        if (!isAdmin) {
          filteredEvents = data.events.filter(
            (e: Event) => !e.school_id || e.school_id === user.role
          )
        }
        setEvents(filteredEvents.sort((a: Event, b: Event) => 
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('event_type', formData.event_type)
      formDataToSend.append('start_date', formData.start_date)
      if (formData.end_date) formDataToSend.append('end_date', formData.end_date)
      if (formData.school_id) formDataToSend.append('school_id', formData.school_id)
      if (imageFile) formDataToSend.append('image', imageFile)

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: editingEvent ? 'Evento actualizado' : 'Evento creado' })
        setShowModal(false)
        setEditingEvent(null)
        setImageFile(null)
        setPreviewImage(null)
        setFormData({
          title: '',
          description: '',
          event_type: 'evento',
          start_date: getTodayDate(),
          end_date: '',
          school_id: user.role === 'admin' ? '' : user.role,
        })
        fetchEvents()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar evento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return

    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEvents(newExpanded)
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || event.event_type === filterType
    return matchesSearch && matchesFilter
  })

  const upcomingEvents = filteredEvents.filter((e) => new Date(e.start_date) >= new Date())
  const pastEvents = filteredEvents.filter((e) => new Date(e.start_date) < new Date())

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header con controles */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Calendario de Eventos</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Gestiona y visualiza todos los eventos institucionales</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)} 
                className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Evento</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Eventos Próximos */}
        {upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
              <span>Eventos Próximos</span>
              <span className="text-sm font-normal text-gray-500">({upcomingEvents.length})</span>
            </h3>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {upcomingEvents.map((event) => {
                  const Icon = eventTypeIcons[event.event_type]
                  const colors = eventTypeColors[event.event_type]
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden transition-all duration-200 hover:shadow-md group`}
                    >
                      {event.image_path ? (
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          <img
                            src={`/api/files/${event.image_path}`}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <div className={`absolute top-2 left-2 ${colors.badge} px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1`}>
                            <Icon className="w-3 h-3" />
                            <span>{eventTypeLabels[event.event_type]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className={`${colors.bg} p-4 rounded-full`}>
                            <Icon className={`w-8 h-8 ${colors.icon}`} />
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {!event.image_path && (
                          <div className={`${colors.badge} inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border mb-2`}>
                            <Icon className="w-3 h-3" />
                            <span>{eventTypeLabels[event.event_type]}</span>
                          </div>
                        )}
                        
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{event.title}</h4>
                        
                        {event.description && (
                          <p className={`text-xs ${colors.text} line-clamp-2 mb-3`}>
                            {event.description}
                          </p>
                        )}
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Clock className={`w-3 h-3 ${colors.icon}`} />
                            <span className="font-medium">{formatDate(event.start_date)}</span>
                          </div>
                          {event.school_id && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <MapPin className={`w-3 h-3 ${colors.icon}`} />
                              <span>
                                {event.school_id === 'sec6' ? 'Sec. 6' : 
                                 event.school_id === 'sec60' ? 'Sec. 60' : 
                                 'Sec. 72'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setEditingEvent(event)
                                setFormData({
                                  title: event.title,
                                  description: event.description,
                                  event_type: event.event_type,
                                  start_date: event.start_date,
                                  end_date: event.end_date || '',
                                  school_id: event.school_id || '',
                                })
                                setShowModal(true)
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const Icon = eventTypeIcons[event.event_type]
                  const colors = eventTypeColors[event.event_type]
                  const isExpanded = expandedEvents.has(event.id)
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {event.image_path && (
                          <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 relative overflow-hidden flex-shrink-0">
                            <img
                              src={`/api/files/${event.image_path}`}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className={`${colors.badge} inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border`}>
                              <Icon className="w-3 h-3" />
                              <span>{eventTypeLabels[event.event_type]}</span>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingEvent(event)
                                    setFormData({
                                      title: event.title,
                                      description: event.description,
                                      event_type: event.event_type,
                                      start_date: event.start_date,
                                      end_date: event.end_date || '',
                                      school_id: event.school_id || '',
                                    })
                                    setShowModal(true)
                                  }}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h4>
                          
                          {event.description && (
                            <div className="mb-3">
                              <p className={`text-sm ${colors.text} ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                {event.description}
                              </p>
                              {event.description.length > 100 && (
                                <button
                                  onClick={() => toggleExpand(event.id)}
                                  className="text-primary-600 text-xs font-medium mt-1 hover:underline flex items-center space-x-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      <span>Ver menos</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>Ver más</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className={`w-4 h-4 ${colors.icon}`} />
                              <span className="font-medium">{formatDate(event.start_date)}</span>
                              {event.end_date && (
                                <>
                                  <span className="text-gray-400">-</span>
                                  <span className="font-medium">{formatDate(event.end_date)}</span>
                                </>
                              )}
                            </div>
                            {event.school_id && (
                              <div className="flex items-center space-x-2">
                                <MapPin className={`w-4 h-4 ${colors.icon}`} />
                                <span>
                                  {event.school_id === 'sec6' ? 'Secundaria 6' : 
                                   event.school_id === 'sec60' ? 'Secundaria 60' : 
                                   'Secundaria 72'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Eventos Pasados */}
        {pastEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
              <span>Eventos Pasados</span>
              <span className="text-sm font-normal text-gray-500">({pastEvents.length})</span>
            </h3>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pastEvents.map((event) => {
                  const Icon = eventTypeIcons[event.event_type]
                  const colors = eventTypeColors[event.event_type]
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden transition-all duration-200 hover:shadow-md group opacity-75`}
                    >
                      {event.image_path ? (
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          <img
                            src={`/api/files/${event.image_path}`}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <div className={`absolute top-2 left-2 ${colors.badge} px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1`}>
                            <Icon className="w-3 h-3" />
                            <span>{eventTypeLabels[event.event_type]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className={`${colors.bg} p-4 rounded-full opacity-60`}>
                            <Icon className={`w-8 h-8 ${colors.icon}`} />
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {!event.image_path && (
                          <div className={`${colors.badge} inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border mb-2 opacity-75`}>
                            <Icon className="w-3 h-3" />
                            <span>{eventTypeLabels[event.event_type]}</span>
                          </div>
                        )}
                        
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{event.title}</h4>
                        
                        {event.description && (
                          <p className={`text-xs ${colors.text} line-clamp-2 mb-3 opacity-75`}>
                            {event.description}
                          </p>
                        )}
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className={`w-3 h-3 ${colors.icon}`} />
                            <span className="font-medium">{formatDate(event.start_date)}</span>
                          </div>
                          {event.school_id && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPin className={`w-3 h-3 ${colors.icon}`} />
                              <span>
                                {event.school_id === 'sec6' ? 'Sec. 6' : 
                                 event.school_id === 'sec60' ? 'Sec. 60' : 
                                 'Sec. 72'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {pastEvents.map((event) => {
                    const Icon = eventTypeIcons[event.event_type]
                    const colors = eventTypeColors[event.event_type]
                    
                    return (
                      <div
                        key={event.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`p-2 ${colors.bg} rounded-lg opacity-75`}>
                              <Icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(event.start_date)}</span>
                                </span>
                                {event.school_id && (
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>
                                      {event.school_id === 'sec6' ? 'Sec. 6' : 
                                       event.school_id === 'sec60' ? 'Sec. 60' : 
                                       'Sec. 72'}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No se encontraron eventos</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || filterType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'No hay eventos registrados aún'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="bg-primary-500 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingEvent(null)
                      setImageFile(null)
                      setPreviewImage(null)
                      setFormData({
                        title: '',
                        description: '',
                        event_type: 'evento',
                        start_date: getTodayDate(),
                        end_date: '',
                        school_id: user.role === 'admin' ? '' : user.role,
                      })
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título del Evento *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      required
                      placeholder="Ej: Día de la Independencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Evento *
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
                      className="input-field"
                      required
                    >
                      {Object.entries(eventTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows={4}
                      placeholder="Descripción detallada del evento..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker
                      value={formData.start_date}
                      onChange={(value) => setFormData({ ...formData, start_date: value })}
                      type="date"
                      label="Fecha de Inicio *"
                      required
                      openUpward={true}
                    />
                    <DatePicker
                      value={formData.end_date}
                      onChange={(value) => setFormData({ ...formData, end_date: value })}
                      type="date"
                      label="Fecha de Fin (opcional)"
                      openUpward={true}
                    />
                  </div>

                  {isAdmin && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Imagen del Evento (opcional)
                        </label>
                        {previewImage ? (
                          <div className="relative">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImage(null)
                                setImageFile(null)
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            {...imageDropzone.getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                              imageDropzone.isDragActive
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            <input {...imageDropzone.getInputProps()} />
                            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-600 text-sm font-medium mb-1">
                              Arrastra una imagen aquí o haz clic para seleccionar
                            </p>
                            <p className="text-xs text-gray-500">
                              Formatos: JPG, PNG, GIF, WEBP
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Escuela (dejar vacío para todas)
                        </label>
                        <select
                          value={formData.school_id}
                          onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Todas las escuelas</option>
                          <option value="sec6">Secundaria 6</option>
                          <option value="sec60">Secundaria 60</option>
                          <option value="sec72">Secundaria 72</option>
                        </select>
                      </div>
                    </>
                  )}

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        message.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingEvent(null)
                        setImageFile(null)
                        setPreviewImage(null)
                        setFormData({
                          title: '',
                          description: '',
                          event_type: 'evento',
                          start_date: getTodayDate(),
                          end_date: '',
                          school_id: user.role === 'admin' ? '' : user.role,
                        })
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                      {loading ? 'Guardando...' : editingEvent ? 'Actualizar' : 'Crear Evento'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
