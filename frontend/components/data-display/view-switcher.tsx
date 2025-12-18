'use client';

import { LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'table' | 'grid';

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewSwitcher({ view, onViewChange, className }: ViewSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-lg border p-1', className)}>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8"
      >
        <Table2 className="h-4 w-4 mr-2" />
        Table
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Grid
      </Button>
    </div>
  );
}

