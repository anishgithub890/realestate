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

const viewingSchema = z.object({
  unit_id: z.string().min(1, 'Property is required'),
  tenant_id: z.string().optional(),
  lead_id: z.string().optional(),
  viewer_name: z.string().min(1, 'Viewer name is required'),
  viewer_email: z.string().email('Invalid email address'),
  viewer_phone: z.string().min(1, 'Viewer phone is required'),
  viewing_date: z.string().min(1, 'Viewing date is required'),
  viewing_time: z.string().min(1, 'Viewing time is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

type ViewingFormData = z.infer<typeof viewingSchema>;

interface ViewingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewing?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function ViewingForm({ open, onOpenChange, viewing, mode, onSuccess }: ViewingFormProps) {
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
  } = useForm<ViewingFormData>({
    resolver: zodResolver(viewingSchema),
  });

  // Fetch dependencies
  const { data: units } = useQuery<any>({
    queryKey: ['units'],
    queryFn: () => api.get('/properties/units', { limit: 1000 }),
    enabled: open,
  });

  const { data: tenants } = useQuery<any>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants', { limit: 1000 }),
    enabled: open,
  });

  const { data: leads } = useQuery<any>({
    queryKey: ['leads'],
    queryFn: () => api.get('/leads', { limit: 1000 }),
    enabled: open,
  });

  const { data: users } = useQuery<any>({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { limit: 1000 }),
    enabled: open,
  });

  useEffect(() => {
    if (viewing && open && mode === 'edit') {
      setValue('unit_id', viewing.unit_id?.toString() || '');
      setValue('tenant_id', viewing.tenant_id?.toString() || 'none');
      setValue('lead_id', viewing.lead_id?.toString() || 'none');
      setValue('viewer_name', viewing.viewer_name || '');
      setValue('viewer_email', viewing.viewer_email || '');
      setValue('viewer_phone', viewing.viewer_phone || '');
      setValue(
        'viewing_date',
        viewing.viewing_date
          ? new Date(viewing.viewing_date).toISOString().split('T')[0]
          : ''
      );
      setValue('viewing_time', viewing.viewing_time || '');
      setValue('status', viewing.status || 'scheduled');
      setValue('notes', viewing.notes || '');
      setValue('assigned_to', viewing.assigned_to?.toString() || 'none');
    } else if (open && mode === 'create') {
      reset();
      setValue('status', 'scheduled');
    }
  }, [viewing, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: ViewingFormData) => {
      const payload: any = {
        unit_id: parseInt(data.unit_id),
        tenant_id: data.tenant_id && data.tenant_id !== 'none' ? parseInt(data.tenant_id) : null,
        lead_id: data.lead_id && data.lead_id !== 'none' ? parseInt(data.lead_id) : null,
        viewer_name: data.viewer_name,
        viewer_email: data.viewer_email,
        viewer_phone: data.viewer_phone,
        viewing_date: new Date(data.viewing_date),
        viewing_time: data.viewing_time,
        status: data.status,
        notes: data.notes || null,
        assigned_to: data.assigned_to && data.assigned_to !== 'none' ? parseInt(data.assigned_to) : null,
      };

      if (mode === 'create') {
        return api.post('/viewings', payload);
      } else {
        return api.put(`/viewings/${viewing.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Viewing scheduled successfully' : 'Viewing updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} viewing`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ViewingFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const unitsList = units?.data || [];
  const tenantsList = tenants?.data || [];
  const leadsList = leads?.data || [];
  const usersList = users?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Schedule Viewing' : 'Edit Viewing'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Schedule a new property viewing appointment'
              : 'Update viewing information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="unit_id">Property *</Label>
            <Select
              value={watch('unit_id') || ''}
              onValueChange={(value) => setValue('unit_id', value)}
            >
              <SelectTrigger className={errors.unit_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {unitsList.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name} - {unit.building?.name || 'N/A'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit_id && (
              <p className="text-sm text-red-500 mt-1">{errors.unit_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewer_name">Viewer Name *</Label>
              <Input
                id="viewer_name"
                {...register('viewer_name')}
                className={errors.viewer_name ? 'border-red-500' : ''}
              />
              {errors.viewer_name && (
                <p className="text-sm text-red-500 mt-1">{errors.viewer_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="viewer_email">Viewer Email *</Label>
              <Input
                id="viewer_email"
                type="email"
                {...register('viewer_email')}
                className={errors.viewer_email ? 'border-red-500' : ''}
              />
              {errors.viewer_email && (
                <p className="text-sm text-red-500 mt-1">{errors.viewer_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewer_phone">Viewer Phone *</Label>
              <Input
                id="viewer_phone"
                {...register('viewer_phone')}
                className={errors.viewer_phone ? 'border-red-500' : ''}
              />
              {errors.viewer_phone && (
                <p className="text-sm text-red-500 mt-1">{errors.viewer_phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status') || ''}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewing_date">Viewing Date *</Label>
              <Input
                id="viewing_date"
                type="date"
                {...register('viewing_date')}
                className={errors.viewing_date ? 'border-red-500' : ''}
              />
              {errors.viewing_date && (
                <p className="text-sm text-red-500 mt-1">{errors.viewing_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="viewing_time">Viewing Time *</Label>
              <Input
                id="viewing_time"
                type="time"
                {...register('viewing_time')}
                className={errors.viewing_time ? 'border-red-500' : ''}
              />
              {errors.viewing_time && (
                <p className="text-sm text-red-500 mt-1">{errors.viewing_time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label htmlFor="lead_id">Lead</Label>
              <Select
                value={watch('lead_id') || 'none'}
                onValueChange={(value) => setValue('lead_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leadsList.map((lead: any) => (
                    <SelectItem key={lead.id} value={lead.id.toString()}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Select
              value={watch('assigned_to') || 'none'}
              onValueChange={(value) => setValue('assigned_to', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent (optional)" />
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

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={4}
              placeholder="Additional notes about the viewing..."
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
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Schedule Viewing' : 'Update Viewing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

