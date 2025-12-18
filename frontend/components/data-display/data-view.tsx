'use client';

import { useState } from 'react';
import { ViewSwitcher, ViewMode } from './view-switcher';
import { DataTable } from './data-table';
import { DataGrid } from './data-grid';
import type { Column } from './data-table';

interface DataViewProps<T extends { id: number | string }> {
  data: T[];
  columns: Column<T>[];
  renderGridItem: (item: T) => React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc' | null) => void;
  defaultView?: ViewMode;
  gridCols?: 1 | 2 | 3 | 4;
  showViewSwitcher?: boolean;
  className?: string;
}

export function DataView<T extends { id: number | string }>({
  data,
  columns,
  renderGridItem,
  isLoading = false,
  error = null,
  emptyMessage = 'No data found',
  pagination,
  onSort,
  defaultView = 'table',
  gridCols = 3,
  showViewSwitcher = true,
  className,
}: DataViewProps<T>) {
  const [view, setView] = useState<ViewMode>(defaultView);

  return (
    <div className={className}>
      {showViewSwitcher && (
        <div className="mb-4 flex justify-end">
          <ViewSwitcher view={view} onViewChange={setView} />
        </div>
      )}

      {view === 'table' ? (
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          error={error}
          emptyMessage={emptyMessage}
          pagination={pagination}
          onSort={onSort}
        />
      ) : (
        <DataGrid
          data={data}
          renderItem={renderGridItem}
          isLoading={isLoading}
          error={error}
          emptyMessage={emptyMessage}
          pagination={pagination}
          gridCols={gridCols}
        />
      )}
    </div>
  );
}

