import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

type TileListProps = {
  children: React.ReactNode[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  showPagination?: boolean;
  className?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  tilesPerRow?: number;
  gap?: string;
};

export default function ViewList({
  children = [],
  page = 1,
  pageSize = 12,
  totalItems,
  showPagination = true,
  className = '',
  isLoading = false,
  onPageChange = undefined,
  onPageSizeChange = undefined,
  tilesPerRow = 3,
  gap = 'gap-6',
}: TileListProps): React.ReactNode {
  const [currentPage, setCurrentPage] = useState(page);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Sync internal state with external props
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    setItemsPerPage(pageSize);
  }, [pageSize]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return children.slice(startIndex, endIndex);
  }, [children, currentPage, itemsPerPage]);

  // Calculate total pages based on totalItems (if provided) or children length
  const totalPages = useMemo(() => {
    if (totalItems !== undefined) {
      return Math.ceil(totalItems / itemsPerPage);
    }
    return Math.ceil(children.length / itemsPerPage);
  }, [children.length, itemsPerPage, totalItems]);

  const totalEntries = totalItems !== undefined ? totalItems : children.length;

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newPageSize = Number(value);
    setItemsPerPage(newPageSize);
    onPageSizeChange?.(newPageSize);

    // Calculate new current page to ensure it's valid with the new page size
    const newTotalPages = Math.ceil(totalEntries / newPageSize);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    setCurrentPage(newCurrentPage);
    onPageChange?.(newCurrentPage);
  };

  const renderSkeletonTiles = () => {
    return Array.from({ length: itemsPerPage }, (_, index) => (
      <div key={`skeleton-${index}`} className="w-full">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    ));
  };

  const getGridCols = () => {
    switch (tilesPerRow) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <Card className={`shadow-xl border-0 overflow-hidden p-0 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className={`grid ${getGridCols()} ${gap}`}>
          {isLoading ? (
            renderSkeletonTiles()
          ) : paginatedData.length === 0 ? (
            <div className="col-span-full">
              <div className="h-32 flex flex-col items-center justify-center text-center text-muted-foreground font-medium text-base">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 opacity-60" />
                  </div>
                  <span>No items available</span>
                </div>
              </div>
            </div>
          ) : (
            paginatedData.map((child, index) => (
              <div key={index} className="w-full">
                {child}
              </div>
            ))
          )}
        </div>
      </CardContent>

      {showPagination && (children.length > 0 || isLoading) && (
        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 px-4 sm:px-6 py-6 border-t border-border/50 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm" />

          <div className="flex items-center justify-center sm:justify-start space-x-3 text-sm font-medium text-muted-foreground relative z-10">
            <span className="whitespace-nowrap">Show</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-9 text-sm font-medium border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card/95 backdrop-blur-md">
                <SelectItem
                  value="6"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  6
                </SelectItem>
                <SelectItem
                  value="12"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  12
                </SelectItem>
                <SelectItem
                  value="24"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  24
                </SelectItem>
                <SelectItem
                  value="48"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  48
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap">of {isLoading ? '...' : totalEntries} items</span>
          </div>

          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className="h-9 w-9 p-0 border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="h-9 w-9 p-0 border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-md border border-border/50">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Page {currentPage} of {isLoading ? '...' : totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading || totalPages === 0}
              className="h-9 w-9 p-0 border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading || totalPages === 0}
              className="h-9 w-9 p-0 border-border/50 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
