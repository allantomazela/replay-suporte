import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const generateReportPDF = async (
  elementId: string,
  filename: string,
) => {
  const container = document.getElementById(elementId)
  if (!container) {
    throw new Error('Elemento do relatório não encontrado')
  }

  // Ensure all images in the element are loaded before capturing
  const images = container.getElementsByTagName('img')
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

  // Check if we have explicit pages defined
  const pages = container.querySelectorAll('.report-page')

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    if (pages.length > 0) {
      // Multi-page logic
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement

        // Capture specific page
        const canvas = await html2canvas(page, {
          scale: 2, // Higher scale for better resolution (Retina-like)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794, // 210mm at 96 DPI
          height: 1123, // 297mm at 96 DPI
          windowWidth: 794,
          windowHeight: 1123,
        })

        const imgData = canvas.toDataURL('image/png')

        if (i > 0) {
          pdf.addPage()
        }

        // Add image to full A4 page
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
      }
    } else {
      // Fallback: Single container slicing logic (legacy behavior)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }
    }

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
