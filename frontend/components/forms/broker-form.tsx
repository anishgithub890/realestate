'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const brokerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  license_number: z.string().optional(),
  license_expiry: z.string().optional(),
  commission_rate: z.string().optional(),
  is_active: z.boolean().default(true),
});

type BrokerFormData = z.infer<typeof brokerSchema>;

interface BrokerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function BrokerForm({ open, onOpenChange, broker, mode, onSuccess }: BrokerFormProps) {
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
  } = useForm<BrokerFormData>({
    resolver: zodResolver(brokerSchema),
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    if (broker && open && mode === 'edit') {
      setValue('name', broker.name || '');
      setValue('email', broker.email || '');
      setValue('phone', broker.phone || broker.mobile_no || '');
      setValue('license_number', broker.license_number || broker.rera_license || '');
      setValue(
        'license_expiry',
        broker.license_expiry
          ? new Date(broker.license_expiry).toISOString().split('T')[0]
          : ''
      );
      setValue('commission_rate', broker.commission_rate?.toString() || '');
      setValue('is_active', broker.is_active !== undefined ? broker.is_active : true);
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
      });
    }
  }, [broker, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: BrokerFormData) => {
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        license_number: data.license_number || null,
        license_expiry: data.license_expiry ? new Date(data.license_expiry) : null,
        commission_rate: data.commission_rate ? parseFloat(data.commission_rate) : null,
        is_active: data.is_active,
      };

      if (mode === 'create') {
        return api.post('/brokers', payload);
      } else {
        return api.put(`/brokers/${broker.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: mode === 'create' ? 'Broker created successfully' : 'Broker updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} broker`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: BrokerFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Broker' : 'Edit Broker'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new real estate broker or agent'
              : 'Update broker information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                {...register('license_number')}
                placeholder="RERA License Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_expiry">License Expiry</Label>
              <Input
                id="license_expiry"
                type="date"
                {...register('license_expiry')}
              />
            </div>

            <div>
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('commission_rate')}
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={watch('is_active')}
              onChange={(e) => setValue('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active</Label>
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
              {mode === 'create' ? 'Create Broker' : 'Update Broker'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

