/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

export type TableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
};

type TableProps = {
  columns: TableColumn[];
  data: Record<string, any>[];
  title?: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  showPagination?: boolean;
  className?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: Record<string, any>) => void;
};

function DeepAccess(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export default function Table({
  columns = [],
  data = [],
  title,
  page = 1,
  pageSize = 10,
  totalItems,
  showPagination = true,
  className = '',
  isLoading = false,
  onPageChange = undefined,
  onPageSizeChange = undefined,
  onRowClick = undefined,
}: TableProps): React.ReactNode {
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
    return data;
  }, [data]);

  // Calculate total pages based on totalItems (if provided) or data length
  const totalPages = useMemo(() => {
    if (totalItems !== undefined) {
      return Math.ceil(totalItems / itemsPerPage);
    }
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage, totalItems]);

  const totalEntries = totalItems !== undefined ? totalItems : data.length;

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

  const renderSkeletonRows = () => {
    return Array.from({ length: itemsPerPage }, (_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column) => (
          <TableCell key={column.key} className="px-6 py-4">
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Card className={`shadow-xl border-0 overflow-hidden p-0 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

      {title && (
        <CardHeader className="pb-6 relative z-10">
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="p-0 relative z-10">
        <div>
          <ShadcnTable>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`font-semibold text-xs tracking-widest text-muted-foreground h-14 px-6 uppercase border-0 backdrop-blur-sm ${
                      column.align ? `text-${column.align}` : 'text-left'
                    }`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderSkeletonRows()
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground font-medium text-base"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 opacity-60" />
                      </div>
                      <span>No data available</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="group hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all duration-300 border-b border-border/30 last:border-b-0 cursor-pointer"
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`px-6 py-5 text-sm font-medium text-foreground leading-6 transition-colors group-hover:text-foreground/90 ${
                          column.align ? `text-${column.align}` : 'text-left'
                        }`}
                      >
                        {column.render
                          ? column.render(DeepAccess(row, column.key), row)
                          : DeepAccess(row, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </ShadcnTable>
        </div>
      </CardContent>

      {showPagination && (data.length > 0 || isLoading) && (
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
                  value="5"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  5
                </SelectItem>
                <SelectItem
                  value="10"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  10
                </SelectItem>
                <SelectItem
                  value="20"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  20
                </SelectItem>
                <SelectItem
                  value="50"
                  className="text-sm font-medium hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10"
                >
                  50
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap">of {isLoading ? '...' : totalEntries} entries</span>
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
