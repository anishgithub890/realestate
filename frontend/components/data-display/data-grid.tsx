'use client';

import { Card } from '@/components/ui/card';
import { DataPagination } from './data-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DataGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  gridCols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DataGrid<T extends { id: number | string }>({
  data,
  renderItem,
  isLoading = false,
  error = null,
  emptyMessage = 'No data found',
  pagination,
  gridCols = 3,
  className,
}: DataGridProps<T>) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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
      {data.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          {emptyMessage}
        </Card>
      ) : (
        <>
          <div className={`grid ${gridColsClass[gridCols]} gap-4`}>
            {data.map((item) => (
              <Card key={item.id} className="p-4">
                {renderItem(item)}
              </Card>
            ))}
          </div>

          {pagination && (
            <div className="mt-4">
              <DataPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

