'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
  storageKey?: string; // Unique key for localStorage (e.g., 'users-view-mode')
  className?: string;
}

// Helper function to get view mode from localStorage
const getStoredViewMode = (storageKey: string | undefined, defaultView: ViewMode): ViewMode => {
  if (typeof window === 'undefined' || !storageKey) {
    return defaultView;
  }
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'table' || stored === 'grid') {
      return stored as ViewMode;
    }
  } catch (error) {
    console.error('Error reading view mode from localStorage:', error);
  }
  
  return defaultView;
};

// Helper function to save view mode to localStorage
const saveViewMode = (storageKey: string | undefined, view: ViewMode): void => {
  if (typeof window === 'undefined' || !storageKey) {
    return;
  }
  
  try {
    localStorage.setItem(storageKey, view);
  } catch (error) {
    console.error('Error saving view mode to localStorage:', error);
  }
};

// Hook to detect screen size
const useIsSmallScreen = (): boolean => {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Tailwind's sm breakpoint is 640px
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isSmallScreen;
};

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
  storageKey,
  className,
}: DataViewProps<T>) {
  const isSmallScreen = useIsSmallScreen();
  
  // Initialize view mode from localStorage if storageKey is provided
  // On small screens, always use grid view
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'grid';
    }
    return getStoredViewMode(storageKey, defaultView);
  });

  // Force grid view on small screens
  useEffect(() => {
    if (isSmallScreen) {
      setView('grid');
    } else {
      // Restore from localStorage when not on small screen
      const storedView = getStoredViewMode(storageKey, defaultView);
      setView(storedView);
    }
  }, [isSmallScreen, storageKey, defaultView]);

  // Save to localStorage whenever view changes (only if not on small screen)
  useEffect(() => {
    if (storageKey && !isSmallScreen) {
      saveViewMode(storageKey, view);
    }
  }, [view, storageKey, isSmallScreen]);

  const handleViewChange = (newView: ViewMode) => {
    // Don't allow view change on small screens
    if (isSmallScreen) {
      return;
    }
    setView(newView);
    if (storageKey) {
      saveViewMode(storageKey, newView);
    }
  };

  // Determine effective view (always grid on small screens)
  const effectiveView = isSmallScreen ? 'grid' : view;

  return (
    <div className={cn("w-full min-w-0 max-w-full", className)}>
      {showViewSwitcher && (
        <div className="mb-4 hidden sm:flex justify-end">
          <ViewSwitcher view={view} onViewChange={handleViewChange} />
        </div>
      )}

      {effectiveView === 'table' ? (
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

