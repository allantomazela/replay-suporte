import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage < 3) {
        for (let i = 0; i < 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      } else if (currentPage > totalPages - 4) {
        pages.push(0)
        pages.push('ellipsis')
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(0)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <Button key={`ellipsis-${index}`} variant="ghost" size="sm" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        const pageNumber = page as number
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber + 1}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
    </div>
  )
}
