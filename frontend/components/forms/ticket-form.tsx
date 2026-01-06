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

const ticketSchema = z.object({
  type_id: z.string().min(1, 'Maintenance type is required'),
  status_id: z.string().min(1, 'Status is required'),
  description: z.string().min(1, 'Description is required'),
  tenant_id: z.string().optional(),
  landlord_id: z.string().optional(),
  unit_id: z.string().optional(),
  assigned_to: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function TicketForm({ open, onOpenChange, ticket, mode, onSuccess }: TicketFormProps) {
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
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  // Fetch dependencies
  const { data: maintenanceTypes } = useQuery<any>({
    queryKey: ['maintenance-types'],
    queryFn: () => api.get('/master-data/maintenance-types', { limit: 1000 }),
    enabled: open,
  });

  const { data: maintenanceStatuses } = useQuery<any>({
    queryKey: ['maintenance-statuses'],
    queryFn: () => api.get('/master-data/maintenance-statuses', { limit: 1000 }),
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

  const { data: units } = useQuery<any>({
    queryKey: ['units'],
    queryFn: () => api.get('/properties/units', { limit: 1000 }),
    enabled: open,
  });

  const { data: users } = useQuery<any>({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { limit: 1000 }),
    enabled: open,
  });

  useEffect(() => {
    if (ticket && open && mode === 'edit') {
      setValue('type_id', ticket.type_id?.toString() || '');
      setValue('status_id', ticket.status_id?.toString() || '');
      setValue('description', ticket.description || '');
      setValue('tenant_id', ticket.tenant_id?.toString() || 'none');
      setValue('landlord_id', ticket.landlord_id?.toString() || 'none');
      setValue('unit_id', ticket.unit_id?.toString() || 'none');
      setValue('assigned_to', ticket.assigned_to?.toString() || 'none');
    } else if (open && mode === 'create') {
      reset();
    }
  }, [ticket, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: TicketFormData) => {
      const payload: any = {
        type_id: parseInt(data.type_id),
        status_id: parseInt(data.status_id),
        description: data.description,
        tenant_id: data.tenant_id && data.tenant_id !== 'none' ? parseInt(data.tenant_id) : null,
        landlord_id: data.landlord_id && data.landlord_id !== 'none' ? parseInt(data.landlord_id) : null,
        unit_id: data.unit_id && data.unit_id !== 'none' ? parseInt(data.unit_id) : null,
        assigned_to: data.assigned_to && data.assigned_to !== 'none' ? parseInt(data.assigned_to) : null,
      };

      if (mode === 'create') {
        return api.post('/tickets', payload);
      } else {
        return api.put(`/tickets/${ticket.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: mode === 'create' ? 'Ticket created successfully' : 'Ticket updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} ticket`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: TicketFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const maintenanceTypesList = maintenanceTypes?.data || [];
  const maintenanceStatusesList = maintenanceStatuses?.data || [];
  const tenantsList = tenants?.data || [];
  const landlordsList = landlords?.data || [];
  const unitsList = units?.data || [];
  const usersList = users?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Ticket' : 'Edit Ticket'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new maintenance ticket'
              : 'Update ticket information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type_id">Maintenance Type *</Label>
              <Select
                value={watch('type_id') || ''}
                onValueChange={(value) => setValue('type_id', value)}
              >
                <SelectTrigger className={errors.type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypesList.map((type: any) => (
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
                  {maintenanceStatusesList.map((status: any) => (
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_id">Property Unit</Label>
              <Select
                value={watch('unit_id') || 'none'}
                onValueChange={(value) => setValue('unit_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {unitsList.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select
                value={watch('assigned_to') || 'none'}
                onValueChange={(value) => setValue('assigned_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {usersList.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
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
              {mode === 'create' ? 'Create Ticket' : 'Update Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

