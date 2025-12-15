import { useState, useMemo } from 'react'

export interface UsePaginationOptions {
  pageSize?: number
  initialPage?: number
}

export interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  pageSize: number
  paginatedData: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void
  startIndex: number
  endIndex: number
  totalItems: number
}

/**
 * Hook para paginação de dados
 * 
 * @param data - Array de dados a serem paginados
 * @param options - Opções de paginação
 * @returns Objeto com dados paginados e controles
 * 
 * @example
 * const { paginatedData, currentPage, totalPages, nextPage, previousPage } = usePagination(clients, { pageSize: 20 })
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { pageSize: initialPageSize = 50, initialPage = 0 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  const goToPage = (page: number) => {
    const validPage = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(validPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  // Reset para primeira página quando dados mudam
  useMemo(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0)
    }
  }, [totalPages, currentPage])

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    startIndex,
    endIndex,
    totalItems: data.length,
  }
}

