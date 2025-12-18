'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataPagination } from './data-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: string; // Optional custom sort key (if different from key)
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (sortBy: string, sortOrder: SortDirection) => void; // Optional: for server-side sorting
  className?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = 'No data found',
  pagination,
  onSort,
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Client-side sorting (if onSort is not provided)
  const sortedData = useMemo(() => {
    if (onSort || !sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection, onSort]);

  const handleSort = (columnKey: string, column: Column<T>) => {
    const sortKey = column.sortKey || String(columnKey);

    if (onSort) {
      // Server-side sorting
      const newDirection =
        sortColumn === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortColumn(sortKey);
      setSortDirection(newDirection);
      onSort(sortKey, newDirection);
    } else {
      // Client-side sorting
      if (sortColumn === sortKey) {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortColumn(null);
          setSortDirection(null);
        } else {
          setSortDirection('asc');
        }
      } else {
        setSortColumn(sortKey);
        setSortDirection('asc');
      }
    }
  };

  const getSortIcon = (columnKey: string, column: Column<T>) => {
    const sortKey = column.sortKey || String(columnKey);
    if (sortColumn !== sortKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'An error occurred while loading data'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const sortKey = column.sortKey || String(column.key);
                const isSortable = column.sortable !== false;
                const isSorted = sortColumn === sortKey;

                return (
                  <TableHead key={String(column.key)} className={column.className}>
                    {isSortable ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              'h-8 px-2 lg:px-3 -ml-3 hover:bg-gray-100',
                              isSorted && 'bg-gray-50'
                            )}
                          >
                            <span className="mr-2">{column.header}</span>
                            {getSortIcon(String(column.key), column)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort(String(column.key), column)}
                            className="cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Sort Ascending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (sortColumn === sortKey && sortDirection === 'asc') {
                                handleSort(String(column.key), column);
                              } else {
                                setSortColumn(sortKey);
                                setSortDirection('desc');
                                if (onSort) {
                                  onSort(sortKey, 'desc');
                                }
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4 mr-2" />
                            Sort Descending
                          </DropdownMenuItem>
                          {isSorted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSortColumn(null);
                                  setSortDirection(null);
                                  if (onSort) {
                                    onSort('', null);
                                  }
                                }}
                                className="cursor-pointer text-gray-500"
                              >
                                Clear Sort
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <DataPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
