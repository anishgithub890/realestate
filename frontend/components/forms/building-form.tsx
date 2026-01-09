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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  area_id: z.string().min(1, 'Area is required'),
  location_id: z.string().optional(),
  completion_date: z.string().optional(),
  is_exempt: z.string().optional(),
  status: z.string().optional(),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

interface BuildingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function BuildingForm({ open, onOpenChange, building, mode, onSuccess }: BuildingFormProps) {
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
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
  });

  // Fetch areas (with pagination to get all)
  const { data: areasData } = useQuery<any>({
    queryKey: ['areas-for-buildings'],
    queryFn: async () => {
      try {
        const allAreas: any[] = [];
        let page = 1;
        let hasMore = true;
        const limit = 100; // Max allowed by validation

        while (hasMore) {
          const response = await api.get('/master-data/areas', { page, limit });
          const areas = (response as any)?.data || [];
          allAreas.push(...areas);
          
          const pagination = (response as any)?.pagination;
          if (!pagination || areas.length < limit || page >= Math.ceil((pagination.total || 0) / limit)) {
            hasMore = false;
          } else {
            page++;
          }
        }

        return {
          success: true,
          data: allAreas,
        };
      } catch (error: any) {
        console.error('Error fetching areas:', error);
        throw error;
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch locations (with pagination to get all)
  const { data: locationsData } = useQuery<any>({
    queryKey: ['locations-for-buildings'],
    queryFn: async () => {
      try {
        const allLocations: any[] = [];
        let page = 1;
        let hasMore = true;
        const limit = 100; // Max allowed by validation

        while (hasMore) {
          const response = await api.get('/locations', { page, limit });
          const locations = (response as any)?.data || [];
          allLocations.push(...locations);
          
          const pagination = (response as any)?.pagination;
          if (!pagination || locations.length < limit || page >= Math.ceil((pagination.total || 0) / limit)) {
            hasMore = false;
          } else {
            page++;
          }
        }

        return {
          success: true,
          data: allLocations,
        };
      } catch (error: any) {
        console.error('Error fetching locations:', error);
        throw error;
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: BuildingFormData) => api.post('/buildings', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Building created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onSuccess?.();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create building',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BuildingFormData }) =>
      api.put(`/buildings/${id}`, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Building updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onSuccess?.();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update building',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (building && open && mode === 'edit') {
      setValue('name', building.name || '');
      setValue('area_id', building.area_id?.toString() || '');
      setValue('location_id', building.location_id || undefined);
      setValue('completion_date', building.completion_date ? new Date(building.completion_date).toISOString().split('T')[0] : '');
      setValue('is_exempt', building.is_exempt || 'false');
      setValue('status', building.status || 'active');
    } else if (open && mode === 'create') {
      reset();
      setValue('is_exempt', 'false');
      setValue('status', 'active');
      setValue('location_id', undefined);
    }
  }, [building, open, mode, setValue, reset]);

  const onSubmit = async (data: BuildingFormData) => {
    setIsSubmitting(true);
    const submitData: any = {
      name: data.name,
      area_id: parseInt(data.area_id),
      location_id: data.location_id === 'none' || !data.location_id ? null : data.location_id,
      completion_date: data.completion_date || null,
      is_exempt: data.is_exempt || 'false',
      status: data.status || 'active',
    };

    if (mode === 'create') {
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: building.id, data: submitData });
    }
  };

  const areas = (areasData as any)?.data || [];
  const locations = (locationsData as any)?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Building' : 'Edit Building'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new building to the system'
              : 'Update building information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Building Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter building name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="area_id">Area *</Label>
            <Select
              value={watch('area_id') || ''}
              onValueChange={(value) => setValue('area_id', value)}
            >
              <SelectTrigger className={errors.area_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area: any) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name} {area.state && `(${area.state.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area_id && (
              <p className="text-sm text-red-500 mt-1">{errors.area_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location_id">Location</Label>
            <Select
              value={watch('location_id') || undefined}
              onValueChange={(value) => setValue('location_id', value === 'none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {locations.map((location: any) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.full_path || location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completion_date">Completion Date</Label>
              <Input
                id="completion_date"
                type="date"
                {...register('completion_date')}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status') || 'active'}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="under_construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="is_exempt">Is Exempt</Label>
            <Select
              value={watch('is_exempt') || 'false'}
              onValueChange={(value) => setValue('is_exempt', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exemption status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
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
              {mode === 'create' ? 'Create Building' : 'Update Building'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

