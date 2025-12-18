'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_no: z.string().optional(),
  mobile_no: z.string().min(1, 'Mobile number is required'),
  emirates_id: z.string().min(1, 'Emirates ID is required'),
  emirates_id_expiry: z.string().optional(),
  residential: z.string().optional(),
  nationality: z.string().optional(),
  passport_no: z.string().optional(),
  passport_expiry: z.string().optional(),
  address: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: any;
  mode: 'create' | 'edit';
}

export function TenantForm({ open, onOpenChange, tenant, mode }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
      ? {
          name: tenant.name,
          email: tenant.email,
          phone_no: tenant.phone_no || '',
          mobile_no: tenant.mobile_no,
          emirates_id: tenant.emirates_id,
          emirates_id_expiry: tenant.emirates_id_expiry
            ? new Date(tenant.emirates_id_expiry).toISOString().split('T')[0]
            : '',
          residential: tenant.residential || '',
          nationality: tenant.nationality || '',
          passport_no: tenant.passport_no || '',
          passport_expiry: tenant.passport_expiry
            ? new Date(tenant.passport_expiry).toISOString().split('T')[0]
            : '',
          address: tenant.address || '',
        }
      : {},
  });

  const onSubmit = async (data: TenantFormData) => {
    try {
      if (mode === 'create') {
        // Include company_id from authenticated user
        const payload = {
          ...data,
          company_id: currentUser?.company_id,
        };
        await api.post('/tenants', payload);
        toast({
          title: 'Success',
          description: 'Tenant created successfully',
        });
      } else {
        await api.put(`/tenants/${tenant.id}`, data);
        toast({
          title: 'Success',
          description: 'Tenant updated successfully',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save tenant',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Tenant' : 'Edit Tenant'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new tenant to the system'
              : 'Update tenant information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_no">Phone</Label>
              <Input id="phone_no" {...register('phone_no')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_no">Mobile *</Label>
              <Input id="mobile_no" {...register('mobile_no')} />
              {errors.mobile_no && (
                <p className="text-sm text-red-600">{errors.mobile_no.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emirates_id">Emirates ID *</Label>
              <Input id="emirates_id" {...register('emirates_id')} />
              {errors.emirates_id && (
                <p className="text-sm text-red-600">{errors.emirates_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emirates_id_expiry">Emirates ID Expiry</Label>
              <Input id="emirates_id_expiry" type="date" {...register('emirates_id_expiry')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...register('nationality')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residential">Residential</Label>
              <Input id="residential" {...register('residential')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passport_no">Passport No</Label>
              <Input id="passport_no" {...register('passport_no')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport_expiry">Passport Expiry</Label>
              <Input id="passport_expiry" type="date" {...register('passport_expiry')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

