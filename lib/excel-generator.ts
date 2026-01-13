import * as XLSX from 'xlsx-js-style'

export interface AttendanceSchoolData {
  ct: string
  totalAlumnos: number
  totalMaestros: number
  asistenciaMaestros: number
  asistenciaAlumnos: number
}

export interface AttendanceFormData {
  date: string
  turno: string
  schools: AttendanceSchoolData[]
}

export function generateAttendanceExcel(data: AttendanceFormData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  const dateParts = data.date.split('-')
  const year = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const day = parseInt(dateParts[2], 10)
  const dateObj = new Date(year, month, day)
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const monthName = monthNames[dateObj.getMonth()]
  const formattedDate = `${day} DE ${monthName.toUpperCase()} ${year}`

  const worksheetData: unknown[][] = []

  worksheetData.push([])
  worksheetData.push([])
  worksheetData.push([
    null,
    `PORCENTAJE DE ALUMNOS Y MAESTROS QUE ASISTIERON EL DÍA DE HOY ${formattedDate}`,
    null,
    null,
    null,
    null
  ])
  worksheetData.push([])
  worksheetData.push([])
  worksheetData.push([])
  worksheetData.push([
    null,
    null,
    null,
    null,
    data.turno,
    null,
    null
  ])
  worksheetData.push([
    null,
    'CT',
    'TOTAL DE ALUMNOS',
    'ASISTENCIA DE ALUMNOS',
    'TOTAL DE MAESTROS',
    'ASISTENCIA DE MAESTROS'
  ])

  data.schools.forEach((school) => {
    worksheetData.push([
      null,
      school.ct,
      school.totalAlumnos,
      school.asistenciaAlumnos,
      school.totalMaestros,
      school.asistenciaMaestros
    ])
  })

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  worksheet['!cols'] = [
    { wch: 2 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 30 },
    { wch: 30 }
  ]

  const centerStyle = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }
  }

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {}
      }
      worksheet[cellAddress].s = { ...worksheet[cellAddress].s, ...centerStyle }
    }
  }

  if (!worksheet['!merges']) worksheet['!merges'] = []
  worksheet['!merges'].push({ s: { r: 2, c: 1 }, e: { r: 2, c: 5 } })
  worksheet['!merges'].push({ s: { r: 6, c: 3 }, e: { r: 6, c: 5 } })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1')

  return workbook
}

export function workbookToBlob(workbook: XLSX.WorkBook): Blob {
  const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx', cellStyles: true })
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
