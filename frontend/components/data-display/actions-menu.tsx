'use client';

import { MoreHorizontal, Edit, Trash2, Eye, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
  className?: string;
}

export function ActionsMenu({ actions, className }: ActionsMenuProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`h-8 w-8 p-0 ${className}`}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Predefined action icons for common actions
export const ActionIcons = {
  Edit: <Edit className="h-4 w-4" />,
  Delete: <Trash2 className="h-4 w-4" />,
  View: <Eye className="h-4 w-4" />,
  Copy: <Copy className="h-4 w-4" />,
  Download: <Download className="h-4 w-4" />,
};

