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

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  level: z.enum(['EMIRATE', 'NEIGHBOURHOOD', 'CLUSTER', 'BUILDING', 'BUILDING_LVL1', 'BUILDING_LVL2']),
  slug: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function LocationForm({ open, onOpenChange, location, mode, onSuccess }: LocationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      is_active: true,
      sort_order: '0',
    },
  });

  const level = watch('level');

  // Fetch parent locations based on selected level
  const { data: parentsData } = useQuery<any>({
    queryKey: ['location-parents', level],
    queryFn: () => {
      if (!level || level === 'EMIRATE') return Promise.resolve({ data: [] });
      
      // Get valid parent levels
      const levelOrder: Record<string, string[]> = {
        NEIGHBOURHOOD: ['EMIRATE'],
        CLUSTER: ['EMIRATE', 'NEIGHBOURHOOD'],
        BUILDING: ['EMIRATE', 'NEIGHBOURHOOD', 'CLUSTER'],
        BUILDING_LVL1: ['BUILDING'],
        BUILDING_LVL2: ['BUILDING_LVL1'],
      };

      const validParentLevels = levelOrder[level] || [];
      if (validParentLevels.length === 0) return Promise.resolve({ data: [] });

      // Fetch locations for each valid parent level
      return Promise.all(
        validParentLevels.map((parentLevel) =>
          api.get(`/locations/level/${parentLevel}`)
        )
      ).then((results) => ({
        data: results.flatMap((r: any) => r.data || []),
      }));
    },
    enabled: !!level && open,
  });

  useEffect(() => {
    if (location && open && mode === 'edit') {
      setValue('name', location.name);
      setValue('level', location.level);
      setValue('slug', location.slug || '');
      setValue('description', location.description || '');
      setValue('parent_id', location.parent_id || '');
      setValue('latitude', location.latitude?.toString() || '');
      setValue('longitude', location.longitude?.toString() || '');
      setValue('is_active', location.is_active);
      setValue('sort_order', location.sort_order?.toString() || '0');
      setSelectedLevel(location.level);
    } else if (open && mode === 'create') {
      reset();
      setSelectedLevel('');
    }
  }, [location, open, mode, setValue, reset]);

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: data.name,
        level: data.level,
        description: data.description || null,
        parent_id: data.parent_id || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order ? parseInt(data.sort_order) : 0,
      };

      if (data.slug) {
        payload.slug = data.slug;
      }

      if (data.latitude) {
        payload.latitude = parseFloat(data.latitude);
      }

      if (data.longitude) {
        payload.longitude = parseFloat(data.longitude);
      }

      if (mode === 'create') {
        await api.post('/locations', payload);
        toast({
          title: 'Success',
          description: 'Location created successfully',
        });
      } else {
        await api.put(`/locations/${location.id}`, payload);
        toast({
          title: 'Success',
          description: 'Location updated successfully',
        });
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} location`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parents = parentsData?.data || [];

  const levelDescriptions: Record<string, string> = {
    EMIRATE: 'Top-level location (e.g., Dubai, Abu Dhabi)',
    NEIGHBOURHOOD: 'Area within an emirate (e.g., Downtown, Marina)',
    CLUSTER: 'Group of buildings (e.g., Business Bay, JLT)',
    BUILDING: 'Individual building',
    BUILDING_LVL1: 'Building level 1 (e.g., Tower A)',
    BUILDING_LVL2: 'Building level 2 (e.g., Wing 1)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Location' : 'Edit Location'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new location to the hierarchy'
              : 'Update location information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Location Name *</Label>
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
              <Label htmlFor="level">Level *</Label>
              <Select
                value={watch('level')}
                onValueChange={(value) => {
                  setValue('level', value as any);
                  setSelectedLevel(value);
                  setValue('parent_id', ''); // Reset parent when level changes
                }}
              >
                <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMIRATE">Emirate</SelectItem>
                  <SelectItem value="NEIGHBOURHOOD">Neighbourhood</SelectItem>
                  <SelectItem value="CLUSTER">Cluster</SelectItem>
                  <SelectItem value="BUILDING">Building</SelectItem>
                  <SelectItem value="BUILDING_LVL1">Building Level 1</SelectItem>
                  <SelectItem value="BUILDING_LVL2">Building Level 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-500 mt-1">{errors.level.message}</p>
              )}
              {level && (
                <p className="text-xs text-muted-foreground mt-1">
                  {levelDescriptions[level]}
                </p>
              )}
            </div>

            {level && level !== 'EMIRATE' && (
              <div className="col-span-2">
                <Label htmlFor="parent_id">Parent Location *</Label>
                <Select
                  value={watch('parent_id')}
                  onValueChange={(value) => setValue('parent_id', value)}
                >
                  <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select parent location" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.length === 0 ? (
                      <SelectItem value="" disabled>
                        No valid parent locations available
                      </SelectItem>
                    ) : (
                      parents.map((parent: any) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name} ({parent.level})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.parent_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.parent_id.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="Auto-generated if empty"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (auto-generated from name if not provided)
              </p>
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order')}
                defaultValue="0"
              />
            </div>

            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.00000001"
                {...register('latitude')}
                placeholder="25.2048"
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.00000001"
                {...register('longitude')}
                placeholder="55.2708"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Enter location description..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded"
              defaultChecked={true}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
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
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Location'
                : 'Update Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

