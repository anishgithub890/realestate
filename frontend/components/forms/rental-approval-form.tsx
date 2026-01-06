'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const approvalSchema = z.object({
  unit_id: z.string().min(1, 'Unit is required'),
  tenant_id: z.string().min(1, 'Tenant is required'),
  remarks: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface RentalApprovalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function RentalApprovalForm({ open, onOpenChange, approval, mode, onSuccess }: RentalApprovalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch units and tenants
  const { data: unitsData } = useQuery<any>({
    queryKey: ['units'],
    queryFn: () => api.get('/units'),
    enabled: open,
  });

  const { data: tenantsData } = useQuery<any>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants'),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  });

  useEffect(() => {
    if (approval && open && mode === 'edit') {
      setValue('unit_id', approval.unit_id.toString());
      setValue('tenant_id', approval.tenant_id.toString());
      setValue('remarks', approval.remarks || '');
    } else if (open && mode === 'create') {
      reset();
    }
  }, [approval, open, mode, setValue, reset]);

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        unit_id: parseInt(data.unit_id),
        tenant_id: parseInt(data.tenant_id),
        remarks: data.remarks || null,
      };

      if (mode === 'create') {
        await api.post('/rental-approvals', payload);
        toast({
          title: 'Success',
          description: 'Rental approval request created successfully',
        });
      } else {
        await api.put(`/rental-approvals/${approval.id}`, payload);
        toast({
          title: 'Success',
          description: 'Rental approval updated successfully',
        });
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} rental approval`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const units = unitsData?.data || [];
  const tenants = tenantsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Rental Approval' : 'Edit Rental Approval'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new rental approval request'
              : 'Update rental approval information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="unit_id">Property Unit *</Label>
            <Select
              value={watch('unit_id')}
              onValueChange={(value) => setValue('unit_id', value)}
            >
              <SelectTrigger className={errors.unit_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name} (Building: {unit.building?.name || 'N/A'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit_id && (
              <p className="text-sm text-red-500 mt-1">{errors.unit_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tenant_id">Tenant *</Label>
            <Select
              value={watch('tenant_id')}
              onValueChange={(value) => setValue('tenant_id', value)}
            >
              <SelectTrigger className={errors.tenant_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant: any) => (
                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                    {tenant.name} ({tenant.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tenant_id && (
              <p className="text-sm text-red-500 mt-1">{errors.tenant_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              {...register('remarks')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Enter remarks or notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Approval'
                : 'Update Approval'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

