'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserX, UserCheck } from 'lucide-react';

interface StatusToggleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isActive: boolean;
  itemName: string;
}

export function StatusToggleDialog({
  open,
  onOpenChange,
  onConfirm,
  isActive,
  itemName,
}: StatusToggleDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const action = isActive ? 'deactivate' : 'activate';
  const actionText = isActive ? 'Deactivate' : 'Activate';
  const icon = isActive ? UserX : UserCheck;
  const iconBgColor = isActive ? 'bg-orange-100' : 'bg-green-100';
  const iconColor = isActive ? 'text-orange-600' : 'text-green-600';
  const buttonColor = isActive
    ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-600'
    : 'bg-green-600 hover:bg-green-700 focus:ring-green-600';

  const Icon = icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <AlertDialogTitle>
              {actionText} {itemName}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {isActive ? (
              <>
                Are you sure you want to deactivate <span className="font-semibold">{itemName}</span>? This will
                prevent them from accessing the system. You can reactivate them later if needed.
              </>
            ) : (
              <>
                Are you sure you want to activate <span className="font-semibold">{itemName}</span>? This will
                restore their access to the system.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className={buttonColor}>
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

