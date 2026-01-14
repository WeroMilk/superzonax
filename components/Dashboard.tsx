'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  FileText,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardList,
  BarChart3,
} from 'lucide-react'
import AsistenciaTab from './tabs/AsistenciaTab'
import ConsejoTecnicoTab from './tabs/ConsejoTecnicoTab'
import ReporteTrimestralTab from './tabs/ReporteTrimestralTab'
import EventosTab from './tabs/EventosTab'
import EvidenciasTab from './tabs/EvidenciasTab'
import RepositorioTab from './tabs/RepositorioTab'

interface User {
  id: number
  username: string
  role: 'admin' | 'sec6' | 'sec60' | 'sec72'
  school_name: string
}

interface DashboardProps {
  user: User
}

const tabs = [
  { id: 'asistencia', label: 'Asistencia Diaria', icon: Users, adminOnly: false },
  { id: 'consejo', label: 'Consejo Técnico', icon: ClipboardList, adminOnly: false },
  { id: 'trimestral', label: 'Reporte Trimestral', icon: BarChart3, adminOnly: false },
  { id: 'eventos', label: 'Eventos', icon: Calendar, adminOnly: false },
  { id: 'evidencias', label: 'Evidencias', icon: ImageIcon, adminOnly: false },
  { id: 'repositorio', label: 'Repositorio', icon: FolderOpen, adminOnly: false },
]

export default function Dashboard({ user }: DashboardProps) {
  // Inicializar activeTab desde localStorage o usar 'asistencia' por defecto
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboard_active_tab')
      if (savedTab && tabs.some(tab => tab.id === savedTab)) {
        return savedTab
      }
    }
    return 'asistencia'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Función para cambiar el tab y guardarlo en localStorage
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_active_tab', tab)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const isAdmin = user.role === 'admin'
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-50 flex-shrink-0">
        <div className="w-full pl-1 pr-2 sm:pl-2 sm:pr-4 lg:pl-3 lg:pr-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Menú"
              >
                {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Actualizar página"
                type="button"
              >
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <img
                    src="/assets/estlogo.png"
                    alt="Logo Supervisión de Zona X"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                  <span className="text-primary-600">Supervisión</span> de Zona X
                </h1>
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user.school_name}</p>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
          <nav className="p-4 space-y-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 relative
                    ${isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }
                  `}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </aside>

        {/* Sidebar Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 top-16 w-64 bg-white border-r border-gray-200 shadow-xl z-40 lg:hidden"
              >
                <nav className="p-4 space-y-1">
                  {visibleTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setSidebarOpen(false)
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                          transition-all duration-200
                          ${isActive
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden h-full flex flex-col bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full overflow-hidden flex flex-col"
            >
              {activeTab === 'asistencia' && <AsistenciaTab user={user} />}
              {activeTab === 'consejo' && <ConsejoTecnicoTab user={user} />}
              {activeTab === 'trimestral' && <ReporteTrimestralTab user={user} />}
              {activeTab === 'eventos' && <EventosTab user={user} />}
              {activeTab === 'evidencias' && <EvidenciasTab user={user} />}
              {activeTab === 'repositorio' && <RepositorioTab user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

