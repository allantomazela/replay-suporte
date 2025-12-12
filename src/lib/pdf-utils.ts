import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const generateReportPDF = async (
  elementId: string,
  filename: string,
) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Elemento do relatório não encontrado')
  }

  // Ensure all images in the element are loaded before capturing
  const images = element.getElementsByTagName('img')
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve(true)
          else {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(true)
          }
        }),
    ),
  )

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better resolution (Retina-like)
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      backgroundColor: '#ffffff', // Force white background
      windowWidth: 794, // Force typical A4 width at ~96 DPI (210mm) to ensure layout consistency
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Add subsequent pages if content overflows
    while (heightLeft > 0) {
      position -= pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
