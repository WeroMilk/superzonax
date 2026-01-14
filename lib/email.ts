import nodemailer from 'nodemailer'
import * as XLSX from 'xlsx-js-style'
import fs from 'fs'
import path from 'path'
import { getDataDir } from './vercel-utils'

/**
 * Descarga un archivo desde una URL y lo guarda temporalmente
 */
async function downloadFileFromUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error al descargar archivo: ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const dataDir = getDataDir()
  const tempPath = path.join(dataDir, `temp_${Date.now()}_${path.basename(url)}`)
  const outputDir = path.dirname(tempPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(tempPath, buffer)
  return tempPath
}

/**
 * Obtiene la ruta del archivo, descargándolo si es una URL
 */
async function getFilePath(file: { path: string; name: string }): Promise<string | null> {
  // Si es una URL de Blob, descargarla primero
  if (file.path.startsWith('http')) {
    try {
      return await downloadFileFromUrl(file.path)
    } catch (error) {
      console.error(`Error al descargar archivo desde URL: ${file.path}`, error)
      return null
    }
  }
  
  // Si es una ruta local, verificar que existe
  if (fs.existsSync(file.path)) {
    return file.path
  }
  
  return null
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
})

export interface EmailConfig {
  reportType: 'attendance' | 'consejo_tecnico' | 'reporte_trimestral'
  recipients: string[]
  files: Array<{ path: string; name: string; schoolId?: string }>
  subject: string
  body: string
}

export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return { success: false, error: 'Configuración de email no encontrada. Por favor configura GMAIL_USER y GMAIL_APP_PASSWORD en Vercel.' }
    }

    const attachments: Array<{ filename: string; path: string }> = []
    let tempExcelPath: string | null = null

    if (config.reportType === 'attendance') {
      tempExcelPath = await createConsolidatedExcel(config.files, config.reportType)
      attachments.push({
        filename: `Consolidado_Asistencia_${new Date().toISOString().split('T')[0]}.xlsx`,
        path: tempExcelPath,
      })
    } else {
      const tempFiles: string[] = []
      for (const file of config.files) {
        const filePath = await getFilePath(file)
        if (filePath) {
          const fileExtension = path.extname(filePath)
          attachments.push({
            filename: `${file.name}${fileExtension}`,
            path: filePath,
          })
          // Si es un archivo temporal descargado, guardarlo para limpiarlo después
          if (filePath.includes('temp_')) {
            tempFiles.push(filePath)
          }
        }
      }
      
      // Limpiar archivos temporales después de enviar el correo
      if (tempFiles.length > 0) {
        setTimeout(() => {
          tempFiles.forEach(tempFile => {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile)
              }
            } catch (error) {
              console.error(`Error al eliminar archivo temporal: ${tempFile}`, error)
            }
          })
        }, 5000) // Esperar 5 segundos para asegurar que el correo se envió
      }
    }

    if (attachments.length === 0) {
      return { success: false, error: 'No hay archivos para adjuntar' }
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: config.recipients.join(', '),
      subject: config.subject,
      html: config.body,
      attachments,
    })

    if (tempExcelPath && fs.existsSync(tempExcelPath)) {
      fs.unlinkSync(tempExcelPath)
    }

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, error: errorMessage }
  }
}

async function createConsolidatedExcel(
  files: Array<{ path: string; name: string }>,
  reportType: string
): Promise<string> {
  const workbook = XLSX.utils.book_new()

  if (reportType === 'attendance') {
    const schools = [
      { id: 'sec6', name: 'Secundaria 6', sheetName: 'Secundaria 6' },
      { id: 'sec60', name: 'Secundaria 60', sheetName: 'Secundaria 60' },
      { id: 'sec72', name: 'Secundaria 72', sheetName: 'Secundaria 72' }
    ]

    for (const school of schools) {
      const schoolFile = files.find(f => 
        f.schoolId === school.id ||
        f.name.includes(school.name) || 
        f.path.includes(school.id)
      )

      if (schoolFile) {
        const filePath = await getFilePath(schoolFile)
        if (filePath) {
          try {
            const fileBuffer = fs.readFileSync(filePath)
            const fileExtension = path.extname(filePath).toLowerCase()
            
            if (fileExtension === '.xlsx' || fileExtension === '.xls') {
              const data = XLSX.read(fileBuffer, { type: 'buffer' })
              if (data.SheetNames.length > 0) {
                const worksheet = data.Sheets[data.SheetNames[0]]
                XLSX.utils.book_append_sheet(workbook, worksheet, school.sheetName)
              }
            } else {
              const worksheet = XLSX.utils.aoa_to_sheet([[`Archivo: ${schoolFile.name}`, 'Tipo: No Excel']])
              XLSX.utils.book_append_sheet(workbook, worksheet, school.sheetName)
            }
          } catch {
            const worksheet = XLSX.utils.aoa_to_sheet([[`Error al leer: ${schoolFile.name}`]])
            XLSX.utils.book_append_sheet(workbook, worksheet, school.sheetName)
          }
        } else {
          const worksheet = XLSX.utils.aoa_to_sheet([['No hay datos para esta escuela']])
          XLSX.utils.book_append_sheet(workbook, worksheet, school.sheetName)
        }
      } else {
        const worksheet = XLSX.utils.aoa_to_sheet([['No hay datos para esta escuela']])
        XLSX.utils.book_append_sheet(workbook, worksheet, school.sheetName)
      }
    }
  } else {
    for (const file of files) {
      const filePath = await getFilePath(file)
      if (filePath) {
        try {
          const fileBuffer = fs.readFileSync(filePath)
          const fileExtension = path.extname(filePath).toLowerCase()
          
          if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            const data = XLSX.read(fileBuffer, { type: 'buffer' })
            data.SheetNames.forEach((sheetName: string) => {
              const worksheet = data.Sheets[sheetName]
              const sheetNameSafe = `${file.name}_${sheetName}`.substring(0, 31).replace(/[\\/?*\[\]]/g, '_')
              XLSX.utils.book_append_sheet(workbook, worksheet, sheetNameSafe)
            })
          } else {
            const worksheet = XLSX.utils.aoa_to_sheet([[`Archivo: ${file.name}`, 'Tipo: No Excel']])
            const sheetNameSafe = file.name.substring(0, 31).replace(/[\\/?*\[\]]/g, '_')
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetNameSafe)
          }
        } catch {
          const worksheet = XLSX.utils.aoa_to_sheet([[`Error al leer: ${file.name}`]])
          const sheetNameSafe = file.name.substring(0, 31).replace(/[\\/?*\[\]]/g, '_')
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetNameSafe)
        }
      }
    }
  }

  if (workbook.SheetNames.length === 0) {
    const worksheet = XLSX.utils.aoa_to_sheet([['No hay archivos para consolidar']])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sin datos')
  }

  const dataDir = getDataDir()
  const outputPath = path.join(dataDir, `temp_${Date.now()}.xlsx`)
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  XLSX.writeFile(workbook, outputPath, { cellStyles: true })
  return outputPath
}
