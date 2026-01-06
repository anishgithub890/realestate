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

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile_no: z.string().min(1, 'Mobile number is required'),
  whatsapp_no: z.string().optional(),
  property_type: z.string().min(1, 'Property type is required'),
  interest_type: z.enum(['Rent', 'Buy']),
  min_price: z.number().min(0),
  max_price: z.number().min(0),
  description: z.string().optional(),
  address: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function LeadForm({ open, onOpenChange, lead, mode, onSuccess }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          name: lead.name,
          email: lead.email,
          mobile_no: lead.mobile_no,
          whatsapp_no: lead.whatsapp_no || '',
          property_type: lead.property_type,
          interest_type: lead.interest_type,
          min_price: lead.min_price,
          max_price: lead.max_price,
          description: lead.description || '',
          address: lead.address || '',
        }
      : {
          interest_type: 'Rent',
        },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (mode === 'create') {
        // Include company_id from authenticated user
        const payload = {
          ...data,
          company_id: currentUser?.company_id,
        };
        await api.post('/leads', payload);
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
      } else {
        await api.put(`/leads/${lead.id}`, data);
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save lead',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Lead' : 'Edit Lead'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new lead to the system'
              : 'Update lead information'}
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
              <Label htmlFor="mobile_no">Mobile No *</Label>
              <Input id="mobile_no" {...register('mobile_no')} />
              {errors.mobile_no && (
                <p className="text-sm text-red-600">{errors.mobile_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_no">WhatsApp No</Label>
              <Input id="whatsapp_no" {...register('whatsapp_no')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type *</Label>
              <Input id="property_type" {...register('property_type')} />
              {errors.property_type && (
                <p className="text-sm text-red-600">{errors.property_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_type">Interest Type *</Label>
              <select
                id="interest_type"
                {...register('interest_type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Rent">Rent</option>
                <option value="Buy">Buy</option>
              </select>
              {errors.interest_type && (
                <p className="text-sm text-red-600">{errors.interest_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Min Price (AED) *</Label>
              <Input
                id="min_price"
                type="number"
                {...register('min_price', { valueAsNumber: true })}
              />
              {errors.min_price && (
                <p className="text-sm text-red-600">{errors.min_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_price">Max Price (AED) *</Label>
              <Input
                id="max_price"
                type="number"
                {...register('max_price', { valueAsNumber: true })}
              />
              {errors.max_price && (
                <p className="text-sm text-red-600">{errors.max_price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
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

