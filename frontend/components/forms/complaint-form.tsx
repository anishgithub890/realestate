'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const complaintSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status_id: z.string().min(1, 'Status is required'),
  tenant_id: z.string().optional(),
  landlord_id: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function ComplaintForm({ open, onOpenChange, complaint, mode, onSuccess }: ComplaintFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  // Fetch dependencies
  const { data: complaintStatuses } = useQuery<any>({
    queryKey: ['complaint-statuses'],
    queryFn: () => api.get('/master-data/complaint-statuses', { limit: 1000 }),
    enabled: open,
  });

  const { data: tenants } = useQuery<any>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants', { limit: 1000 }),
    enabled: open,
  });

  const { data: landlords } = useQuery<any>({
    queryKey: ['landlords'],
    queryFn: () => api.get('/landlords', { limit: 1000 }),
    enabled: open,
  });

  useEffect(() => {
    if (complaint && open && mode === 'edit') {
      setValue('type', complaint.type || '');
      setValue('title', complaint.title || '');
      setValue('description', complaint.description || '');
      setValue('status_id', complaint.status_id?.toString() || '');
      setValue('tenant_id', complaint.tenant_id?.toString() || 'none');
      setValue('landlord_id', complaint.landlord_id?.toString() || 'none');
    } else if (open && mode === 'create') {
      reset();
    }
  }, [complaint, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: ComplaintFormData) => {
      const payload: any = {
        type: data.type,
        title: data.title,
        description: data.description,
        status_id: parseInt(data.status_id),
        tenant_id: data.tenant_id && data.tenant_id !== 'none' ? parseInt(data.tenant_id) : null,
        landlord_id: data.landlord_id && data.landlord_id !== 'none' ? parseInt(data.landlord_id) : null,
      };

      if (mode === 'create') {
        return api.post('/complaints', payload);
      } else {
        return api.put(`/complaints/${complaint.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: mode === 'create' ? 'Complaint created successfully' : 'Complaint updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} complaint`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ComplaintFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const complaintStatusesList = complaintStatuses?.data || [];
  const tenantsList = tenants?.data || [];
  const landlordsList = landlords?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Complaint' : 'Edit Complaint'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new complaint or suggestion'
              : 'Update complaint information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={watch('type') || ''}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status_id">Status *</Label>
              <Select
                value={watch('status_id') || ''}
                onValueChange={(value) => setValue('status_id', value)}
              >
                <SelectTrigger className={errors.status_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {complaintStatusesList.map((status: any) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status_id && (
                <p className="text-sm text-red-500 mt-1">{errors.status_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenant_id">Tenant</Label>
              <Select
                value={watch('tenant_id') || 'none'}
                onValueChange={(value) => setValue('tenant_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {tenantsList.map((tenant: any) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="landlord_id">Landlord</Label>
              <Select
                value={watch('landlord_id') || 'none'}
                onValueChange={(value) => setValue('landlord_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select landlord (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {landlordsList.map((landlord: any) => (
                    <SelectItem key={landlord.id} value={landlord.id.toString()}>
                      {landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Complaint' : 'Update Complaint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

