"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number // 0-indexed for API, but displayed as 1-indexed
    totalPages: number
    onPageChange: (page: number) => void
    pageSize?: number
    totalElements?: number
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    totalElements,
    className,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null
    }

    const displayPage = currentPage + 1 // Convert to 1-indexed for display

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (displayPage > 3) {
                pages.push("...")
            }

            // Show pages around current
            const start = Math.max(2, displayPage - 1)
            const end = Math.min(totalPages - 1, displayPage + 1)

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i)
                }
            }

            if (displayPage < totalPages - 2) {
                pages.push("...")
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className={cn("flex items-center justify-between gap-4 flex-wrap", className)}>
            {/* Info text */}
            {totalElements !== undefined && pageSize !== undefined && (
                <p className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-medium">{currentPage * pageSize + 1}</span>
                    -
                    <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                    </span>{" "}
                    de <span className="font-medium">{totalElements}</span> resultados
                </p>
            )}

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    className={cn(
                        "rounded-full border-gray-200",
                        currentPage === 0 && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                {pageNumbers.map((pageNum, index) => {
                    if (pageNum === "...") {
                        return (
                            <div
                                key={`ellipsis-${index}`}
                                className="flex items-center justify-center w-9 h-9"
                            >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )
                    }

                    const page = Number(pageNum)
                    const isActive = page === displayPage

                    return (
                        <Button
                            key={page}
                            variant={isActive ? "default" : "outline"}
                            size="icon-sm"
                            className={cn(
                                "rounded-full w-9 h-9",
                                isActive
                                    ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
                            )}
                            onClick={() => onPageChange(page - 1)} // Convert back to 0-indexed
                        >
                            {page}
                        </Button>
                    )
                })}

                {/* Next button */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    className={cn(
                        "rounded-full border-gray-200",
                        currentPage >= totalPages - 1 && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
