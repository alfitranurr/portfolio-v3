import * as React from 'react'

export function usePagination(totalItems: number, pageSize: number) {
  const [currentPage, setCurrentPage] = React.useState(1)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize

  return {
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  }
}
