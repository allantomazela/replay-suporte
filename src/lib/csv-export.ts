/**
 * Funções para exportação de dados em CSV
 */

export interface CSVExportOptions {
  filename?: string
  headers?: string[]
  delimiter?: string
}

/**
 * Converte array de objetos para CSV
 */
export const arrayToCSV = <T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions = {},
): string => {
  const { delimiter = ',' } = options

  if (data.length === 0) return ''

  // Usar headers fornecidos ou extrair do primeiro objeto
  const headers =
    options.headers ||
    Object.keys(data[0]).filter((key) => key !== 'id') // Excluir ID por padrão

  // Criar linha de cabeçalho
  const headerRow = headers
    .map((header) => escapeCSVValue(header))
    .join(delimiter)

  // Criar linhas de dados
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        return escapeCSVValue(value ?? '')
      })
      .join(delimiter),
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Escapa valores para CSV
 */
const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  
  const stringValue = String(value)
  
  // Se contém vírgula, aspas ou quebra de linha, precisa ser envolvido em aspas
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escapar aspas duplicando-as
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Faz download de um arquivo CSV
 */
export const downloadCSV = (
  csvContent: string,
  filename: string = 'export.csv',
): void => {
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta array de objetos para CSV e faz download
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions = {},
): void => {
  const filename = options.filename || `export-${new Date().toISOString().split('T')[0]}.csv`
  const csvContent = arrayToCSV(data, options)
  downloadCSV(csvContent, filename)
}

