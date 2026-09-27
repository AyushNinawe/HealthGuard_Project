import { useState, useMemo } from 'react'
import { ITEMS_PER_PAGE } from '../utils/constants'

export function usePagination(totalItems, itemsPerPage = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  const paginatedRange = useMemo(() => {
    const delta = 2
    const range = []
    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)
    range.push(1)
    if (left > 2) range.push('...')
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push('...')
    if (totalPages > 1) range.push(totalPages)
    return range
  }, [currentPage, totalPages])

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }
  function nextPage() { goToPage(currentPage + 1) }
  function prevPage() { goToPage(currentPage - 1) }
  function reset()    { setCurrentPage(1) }

  return { currentPage, totalPages, goToPage, nextPage, prevPage, reset, paginatedRange }
}
