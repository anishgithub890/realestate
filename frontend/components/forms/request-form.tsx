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

const requestSchema = z.object({
  type_id: z.string().min(1, 'Request type is required'),
  status_id: z.string().min(1, 'Status is required'),
  description: z.string().min(1, 'Description is required'),
  tenant_id: z.string().optional(),
  landlord_id: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function RequestForm({ open, onOpenChange, request, mode, onSuccess }: RequestFormProps) {
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
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  // Fetch dependencies
  const { data: requestTypes } = useQuery<any>({
    queryKey: ['request-types'],
    queryFn: () => api.get('/master-data/request-types', { limit: 1000 }),
    enabled: open,
  });

  const { data: requestStatuses } = useQuery<any>({
    queryKey: ['request-statuses'],
    queryFn: () => api.get('/master-data/request-statuses', { limit: 1000 }),
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
    if (request && open && mode === 'edit') {
      setValue('type_id', request.type_id?.toString() || '');
      setValue('status_id', request.status_id?.toString() || '');
      setValue('description', request.description || '');
      setValue('tenant_id', request.tenant_id?.toString() || 'none');
      setValue('landlord_id', request.landlord_id?.toString() || 'none');
    } else if (open && mode === 'create') {
      reset();
    }
  }, [request, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: RequestFormData) => {
      const payload: any = {
        type_id: parseInt(data.type_id),
        status_id: parseInt(data.status_id),
        description: data.description,
        tenant_id: data.tenant_id && data.tenant_id !== 'none' ? parseInt(data.tenant_id) : null,
        landlord_id: data.landlord_id && data.landlord_id !== 'none' ? parseInt(data.landlord_id) : null,
      };

      if (mode === 'create') {
        return api.post('/requests', payload);
      } else {
        return api.put(`/requests/${request.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: mode === 'create' ? 'Request created successfully' : 'Request updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} request`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: RequestFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const requestTypesList = requestTypes?.data || [];
  const requestStatusesList = requestStatuses?.data || [];
  const tenantsList = tenants?.data || [];
  const landlordsList = landlords?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Request' : 'Edit Request'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new request'
              : 'Update request information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type_id">Request Type *</Label>
              <Select
                value={watch('type_id') || ''}
                onValueChange={(value) => setValue('type_id', value)}
              >
                <SelectTrigger className={errors.type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypesList.map((type: any) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type_id && (
                <p className="text-sm text-red-500 mt-1">{errors.type_id.message}</p>
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
                  {requestStatusesList.map((status: any) => (
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
              {mode === 'create' ? 'Create Request' : 'Update Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

