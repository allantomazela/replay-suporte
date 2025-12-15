import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Exporta dados para CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  // Obter cabeçalhos
  const csvHeaders = headers || Object.keys(data[0])
  
  // Criar conteúdo CSV
  const csvContent = [
    csvHeaders.join(','),
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header]
          // Escapar vírgulas e aspas
          if (value === null || value === undefined) return ''
          const stringValue = String(value).replace(/"/g, '""')
          return `"${stringValue}"`
        })
        .join(',')
    ),
  ].join('\n')

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporta dados para PDF
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const startY = 30
  let y = startY

  // Título
  doc.setFontSize(16)
  doc.text(title, margin, y)
  y += 10

  // Data de exportação
  doc.setFontSize(10)
  doc.text(
    `Exportado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    margin,
    y
  )
  y += 15

  // Cabeçalhos
  const csvHeaders = headers || Object.keys(data[0])
  const colWidth = (pageWidth - 2 * margin) / csvHeaders.length

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  csvHeaders.forEach((header, index) => {
    doc.text(header, margin + index * colWidth, y)
  })
  y += 8

  // Dados
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  data.forEach((row, rowIndex) => {
    // Verificar se precisa de nova página
    if (y > pageHeight - 30) {
      doc.addPage()
      y = 20
    }

    csvHeaders.forEach((header, colIndex) => {
      const value = row[header]
      const text = value !== null && value !== undefined ? String(value) : ''
      // Truncar texto muito longo
      const truncatedText = text.length > 30 ? text.substring(0, 27) + '...' : text
      doc.text(truncatedText, margin + colIndex * colWidth, y)
    })
    y += 7
  })

  // Salvar
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

/**
 * Exporta tabela HTML para CSV/PDF
 */
export function exportTable(
  tableId: string,
  filename: string,
  format: 'csv' | 'pdf' = 'csv'
): void {
  const table = document.getElementById(tableId) as HTMLTableElement
  if (!table) {
    alert('Tabela não encontrada')
    return
  }

  const headers: string[] = []
  const rows: string[][] = []

  // Extrair cabeçalhos
  const headerCells = table.querySelectorAll('thead th')
  headerCells.forEach((cell) => {
    headers.push(cell.textContent?.trim() || '')
  })

  // Extrair dados
  const bodyRows = table.querySelectorAll('tbody tr')
  bodyRows.forEach((row) => {
    const rowData: string[] = []
    const cells = row.querySelectorAll('td')
    cells.forEach((cell) => {
      rowData.push(cell.textContent?.trim() || '')
    })
    rows.push(rowData)
  })

  // Converter para formato de dados
  const data = rows.map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ''
    })
    return obj
  })

  if (format === 'csv') {
    exportToCSV(data, filename, headers)
  } else {
    exportToPDF(data, filename, filename, headers)
  }
}

