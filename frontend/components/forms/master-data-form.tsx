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

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const stateSchema = baseSchema.extend({
  country_id: z.string().min(1, 'Country is required'),
  authorative_name: z.string().optional(),
});

const areaSchema = baseSchema.extend({
  state_id: z.string().min(1, 'State is required'),
});

const leadStatusSchema = baseSchema.extend({
  category: z.string().optional(),
});

const kycDocTypeSchema = baseSchema.extend({
  is_mandatory: z.string().optional(),
});

type MasterDataFormData = z.infer<typeof baseSchema> | z.infer<typeof stateSchema> | z.infer<typeof areaSchema> | z.infer<typeof leadStatusSchema> | z.infer<typeof kycDocTypeSchema>;

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
  mode: 'create' | 'edit';
  type: string;
  onSuccess?: () => void;
}

export function MasterDataForm({ open, onOpenChange, item, mode, type, onSuccess }: MasterDataFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get schema based on type
  const getSchema = () => {
    switch (type) {
      case 'state':
        return stateSchema;
      case 'area':
        return areaSchema;
      case 'lead-status':
        return leadStatusSchema;
      case 'kyc-doc-type':
        return kycDocTypeSchema;
      default:
        return baseSchema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MasterDataFormData>({
    resolver: zodResolver(getSchema()),
  });

  // Fetch dependencies for state and area
  const { data: countriesData } = useQuery<any>({
    queryKey: ['countries'],
    queryFn: () => api.get('/master-data/countries', { limit: 1000 }),
    enabled: (type === 'state' || type === 'area') && open,
  });

  const { data: statesData } = useQuery<any>({
    queryKey: ['states'],
    queryFn: () => api.get('/master-data/states', { limit: 1000 }),
    enabled: type === 'area' && open,
  });

  useEffect(() => {
    if (item && open && mode === 'edit') {
      setValue('name', item.name);
      if (type === 'state' && item.country_id) {
        setValue('country_id', item.country_id.toString());
      }
      if (type === 'state' && item.authorative_name) {
        setValue('authorative_name', item.authorative_name);
      }
      if (type === 'area' && item.state_id) {
        setValue('state_id', item.state_id.toString());
      }
      if (type === 'lead-status' && item.category) {
        setValue('category', item.category);
      }
      if (type === 'kyc-doc-type' && item.is_mandatory) {
        setValue('is_mandatory', item.is_mandatory);
      }
    } else if (open && mode === 'create') {
      reset();
    }
  }, [item, open, mode, type, setValue, reset]);

  const onSubmit = async (data: MasterDataFormData) => {
    setIsSubmitting(true);
    try {
      const endpoint = `/master-data/${type.replace(/-/g, '-')}`;
      const payload: any = { name: data.name };

      if (type === 'state') {
        payload.country_id = parseInt((data as any).country_id);
        if ((data as any).authorative_name) {
          payload.authorative_name = (data as any).authorative_name;
        }
      }

      if (type === 'area') {
        payload.state_id = parseInt((data as any).state_id);
      }

      if (type === 'lead-status') {
        payload.category = (data as any).category || 'new';
      }

      if (type === 'kyc-doc-type') {
        payload.is_mandatory = (data as any).is_mandatory || 'false';
      }

      if (mode === 'create') {
        await api.post(endpoint, payload);
        toast({
          title: 'Success',
          description: `${getTypeLabel()} created successfully`,
        });
      } else {
        await api.put(`${endpoint}/${item.id}`, payload);
        toast({
          title: 'Success',
          description: `${getTypeLabel()} updated successfully`,
        });
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} ${type}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = countriesData?.data || [];
  const states = statesData?.data || [];

  const getTypeLabel = () => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? `Create ${getTypeLabel()}` : `Edit ${getTypeLabel()}`}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? `Add a new ${getTypeLabel().toLowerCase()}`
              : `Update ${getTypeLabel().toLowerCase()} information`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{(errors.name as any)?.message}</p>
            )}
          </div>

          {type === 'state' && (
            <>
              <div>
                <Label htmlFor="country_id">Country *</Label>
                <Select
                  value={watch('country_id' as any) || ''}
                  onValueChange={(value) => setValue('country_id', value)}
                >
                  <SelectTrigger className={(errors as any).country_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country: any) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errors as any).country_id && (
                  <p className="text-sm text-red-500 mt-1">{((errors as any).country_id as any)?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="authorative_name">Authoritative Name</Label>
                <Input
                  id="authorative_name"
                  {...register('authorative_name')}
                />
              </div>
            </>
          )}

          {type === 'area' && (
            <div>
              <Label htmlFor="state_id">State *</Label>
              <Select
                value={watch('state_id' as any) || ''}
                onValueChange={(value) => setValue('state_id', value)}
              >
                <SelectTrigger className={(errors as any).state_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state: any) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name} ({state.country?.name || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors as any).state_id && (
                <p className="text-sm text-red-500 mt-1">{((errors as any).state_id as any)?.message}</p>
              )}
            </div>
          )}

          {type === 'lead-status' && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category' as any) || 'new'}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'kyc-doc-type' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_mandatory"
                {...register('is_mandatory')}
                className="rounded"
                defaultChecked={false}
              />
              <Label htmlFor="is_mandatory" className="cursor-pointer">
                Mandatory
              </Label>
            </div>
          )}

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
                ? `Create ${getTypeLabel()}`
                : `Update ${getTypeLabel()}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

