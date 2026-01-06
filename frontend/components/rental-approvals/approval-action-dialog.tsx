'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'approve' | 'reject' | null;
  onConfirm: (remarks?: string) => void;
  isLoading?: boolean;
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
  isLoading = false,
}: ApprovalActionDialogProps) {
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    onConfirm(remarks || undefined);
    setRemarks('');
  };

  const handleCancel = () => {
    setRemarks('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'approve' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Approve Rental Request
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Rental Request
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === 'approve'
              ? 'Are you sure you want to approve this rental request?'
              : 'Are you sure you want to reject this rental request?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md mt-2"
              placeholder="Enter remarks or notes..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? type === 'approve'
                ? 'Approving...'
                : 'Rejecting...'
              : type === 'approve'
              ? 'Approve'
              : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

