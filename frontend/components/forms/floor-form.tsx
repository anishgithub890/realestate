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

const floorSchema = z.object({
  name: z.string().min(1, 'Floor name is required'),
  building_id: z.string().min(1, 'Building is required'),
});

type FloorFormData = z.infer<typeof floorSchema>;

interface FloorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floor?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function FloorForm({ open, onOpenChange, floor, mode, onSuccess }: FloorFormProps) {
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
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorSchema),
  });

  // Fetch buildings (with pagination to get all)
  const { data: buildingsData, isLoading: isLoadingBuildings, error: buildingsError } = useQuery<any>({
    queryKey: ['buildings-for-floors'],
    queryFn: async () => {
      try {
        // Fetch all buildings by making multiple requests if needed
        // Max limit is 100 per validation, so we'll fetch page by page
        const allBuildings: any[] = [];
        let page = 1;
        let hasMore = true;
        const limit = 100; // Max allowed by validation

        while (hasMore) {
          const response = await api.get('/buildings', { page, limit });
          const buildings = (response as any)?.data || [];
          allBuildings.push(...buildings);
          
          const pagination = (response as any)?.pagination;
          if (!pagination || buildings.length < limit || page >= Math.ceil((pagination.total || 0) / limit)) {
            hasMore = false;
          } else {
            page++;
          }
        }

        return {
          success: true,
          data: allBuildings,
        };
      } catch (error: any) {
        console.error('Error fetching buildings:', error);
        throw error;
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: FloorFormData) => api.post('/floors', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Floor created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onSuccess?.();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create floor',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FloorFormData }) =>
      api.put(`/floors/${id}`, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Floor updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onSuccess?.();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update floor',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (floor && open && mode === 'edit') {
      setValue('name', floor.name || '');
      setValue('building_id', floor.building_id?.toString() || '');
    } else if (open && mode === 'create') {
      reset();
    }
  }, [floor, open, mode, setValue, reset]);

  const onSubmit = async (data: FloorFormData) => {
    setIsSubmitting(true);
    const submitData: any = {
      name: data.name,
      building_id: parseInt(data.building_id),
    };

    if (mode === 'create') {
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: floor.id, data: submitData });
    }
  };

  const buildings = (buildingsData as any)?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Floor' : 'Edit Floor'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new floor to a building'
              : 'Update floor information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Floor Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter floor name (e.g., Ground Floor, 1st Floor)"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="building_id">Building *</Label>
            <Select
              value={watch('building_id') || ''}
              onValueChange={(value) => setValue('building_id', value)}
              disabled={isLoadingBuildings}
            >
              <SelectTrigger className={errors.building_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={isLoadingBuildings ? 'Loading buildings...' : 'Select building'} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBuildings ? (
                  <SelectItem value="loading" disabled>Loading buildings...</SelectItem>
                ) : buildings.length === 0 ? (
                  <SelectItem value="no-buildings" disabled>No buildings available</SelectItem>
                ) : (
                  buildings.map((building: any) => (
                    <SelectItem key={building.id} value={building.id.toString()}>
                      {building.name} {building.area && `(${building.area.name})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.building_id && (
              <p className="text-sm text-red-500 mt-1">{errors.building_id.message}</p>
            )}
            {buildingsError && (
              <p className="text-sm text-red-500 mt-1">Error loading buildings. Please try again.</p>
            )}
            {!isLoadingBuildings && !buildingsError && buildings.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">No buildings found. Please create a building first.</p>
            )}
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
              {mode === 'create' ? 'Create Floor' : 'Update Floor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

