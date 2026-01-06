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

const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  gross_area_in_sqft: z.string().min(1, 'Area is required'),
  ownership: z.string().min(1, 'Ownership is required'),
  basic_rent: z.string().optional(),
  basic_sale_value: z.string().optional(),
  premise_no: z.string().min(1, 'Premise number is required'),
  status: z.string().min(1, 'Status is required'),
  property_type: z.string().min(1, 'Property type is required'),
  no_of_bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  no_of_bedrooms: z.string().optional(),
  no_of_parkings: z.string().optional(),
  building_id: z.string().min(1, 'Building is required'),
  floor_id: z.string().min(1, 'Floor is required'),
  unit_type_id: z.string().min(1, 'Unit type is required'),
  owned_by: z.string().optional(),
  furnished_type: z.string().optional(),
  view_type: z.string().optional(),
  floor_number: z.string().optional(),
  total_floors: z.string().optional(),
  year_built: z.string().optional(),
  listing_type: z.string().optional(),
  description: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function UnitForm({ open, onOpenChange, unit, mode, onSuccess }: UnitFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
  });

  const buildingId = watch('building_id');

  // Fetch buildings
  const { data: buildingsData } = useQuery<any>({
    queryKey: ['buildings'],
    queryFn: () => api.get('/properties/buildings'),
    enabled: open,
  });

  // Fetch floors for selected building
  const { data: floorsData } = useQuery<any>({
    queryKey: ['floors', buildingId],
    queryFn: () => api.get(`/properties/buildings/${buildingId}/floors`),
    enabled: !!buildingId && open,
  });

  // Fetch unit types
  const { data: unitTypesData } = useQuery<any>({
    queryKey: ['unit-types'],
    queryFn: () => api.get('/properties/unit-types'),
    enabled: open,
  });

  // Fetch landlords
  const { data: landlordsData } = useQuery<any>({
    queryKey: ['landlords'],
    queryFn: () => api.get('/landlords'),
    enabled: open,
  });

  useEffect(() => {
    if (unit && open && mode === 'edit') {
      setValue('name', unit.name);
      setValue('gross_area_in_sqft', unit.gross_area_in_sqft?.toString());
      setValue('ownership', unit.ownership);
      setValue('basic_rent', unit.basic_rent?.toString());
      setValue('basic_sale_value', unit.basic_sale_value?.toString());
      setValue('premise_no', unit.premise_no);
      setValue('status', unit.status);
      setValue('property_type', unit.property_type);
      setValue('no_of_bathrooms', unit.no_of_bathrooms?.toString());
      setValue('no_of_bedrooms', unit.no_of_bedrooms?.toString());
      setValue('no_of_parkings', unit.no_of_parkings?.toString());
      setValue('building_id', unit.building_id?.toString());
      setValue('floor_id', unit.floor_id?.toString());
      setValue('unit_type_id', unit.unit_type_id?.toString());
      setValue('owned_by', unit.owned_by?.toString() || 'none');
      setValue('furnished_type', unit.furnished_type || 'none');
      setValue('view_type', unit.view_type || 'none');
      setValue('floor_number', unit.floor_number?.toString());
      setValue('total_floors', unit.total_floors?.toString());
      setValue('year_built', unit.year_built?.toString());
      setValue('listing_type', unit.listing_type || '');
      setValue('description', unit.description || '');
      setSelectedBuilding(unit.building_id?.toString());
    } else if (open && mode === 'create') {
      reset();
      setSelectedBuilding('');
    }
  }, [unit, open, mode, setValue, reset]);

  const onSubmit = async (data: UnitFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        gross_area_in_sqft: parseFloat(data.gross_area_in_sqft),
        basic_rent: data.basic_rent ? parseFloat(data.basic_rent) : null,
        basic_sale_value: data.basic_sale_value ? parseFloat(data.basic_sale_value) : null,
        no_of_bathrooms: parseInt(data.no_of_bathrooms),
        no_of_bedrooms: data.no_of_bedrooms ? parseInt(data.no_of_bedrooms) : null,
        no_of_parkings: data.no_of_parkings ? parseInt(data.no_of_parkings) : null,
        building_id: parseInt(data.building_id),
        floor_id: parseInt(data.floor_id),
        unit_type_id: parseInt(data.unit_type_id),
        owned_by: data.owned_by && data.owned_by !== 'none' ? parseInt(data.owned_by) : null,
        furnished_type: data.furnished_type && data.furnished_type !== 'none' ? data.furnished_type : null,
        view_type: data.view_type && data.view_type !== 'none' ? data.view_type : null,
        listing_type: data.listing_type && data.listing_type !== 'none' ? data.listing_type : null,
        floor_number: data.floor_number ? parseInt(data.floor_number) : null,
        total_floors: data.total_floors ? parseInt(data.total_floors) : null,
        year_built: data.year_built ? parseInt(data.year_built) : null,
      };

      if (mode === 'create') {
        await api.post('/properties/units', payload);
        toast({
          title: 'Success',
          description: 'Unit created successfully',
        });
      } else {
        await api.put(`/properties/units/${unit.id}`, payload);
        toast({
          title: 'Success',
          description: 'Unit updated successfully',
        });
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} unit`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildings = buildingsData?.data || [];
  const floors = floorsData?.data || [];
  const unitTypes = unitTypesData?.data || [];
  const landlords = landlordsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Unit' : 'Edit Unit'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new property unit to the system'
              : 'Update unit information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Unit Name *</Label>
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
              <Label htmlFor="premise_no">Premise Number *</Label>
              <Input
                id="premise_no"
                {...register('premise_no')}
                className={errors.premise_no ? 'border-red-500' : ''}
              />
              {errors.premise_no && (
                <p className="text-sm text-red-500 mt-1">{errors.premise_no.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="building_id">Building *</Label>
              <Select
                value={buildingId}
                onValueChange={(value) => {
                  setValue('building_id', value);
                  setSelectedBuilding(value);
                  setValue('floor_id', ''); // Reset floor when building changes
                }}
              >
                <SelectTrigger className={errors.building_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building: any) => (
                    <SelectItem key={building.id} value={building.id.toString()}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.building_id && (
                <p className="text-sm text-red-500 mt-1">{errors.building_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="floor_id">Floor *</Label>
              <Select
                value={watch('floor_id')}
                onValueChange={(value) => setValue('floor_id', value)}
                disabled={!buildingId}
              >
                <SelectTrigger className={errors.floor_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor: any) => (
                    <SelectItem key={floor.id} value={floor.id.toString()}>
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.floor_id && (
                <p className="text-sm text-red-500 mt-1">{errors.floor_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit_type_id">Unit Type *</Label>
              <Select
                value={watch('unit_type_id')}
                onValueChange={(value) => setValue('unit_type_id', value)}
              >
                <SelectTrigger className={errors.unit_type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_type_id && (
                <p className="text-sm text-red-500 mt-1">{errors.unit_type_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={watch('property_type')}
                onValueChange={(value) => setValue('property_type', value)}
              >
                <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                </SelectContent>
              </Select>
              {errors.property_type && (
                <p className="text-sm text-red-500 mt-1">{errors.property_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ownership">Ownership *</Label>
              <Select
                value={watch('ownership')}
                onValueChange={(value) => setValue('ownership', value)}
              >
                <SelectTrigger className={errors.ownership ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freehold">Freehold</SelectItem>
                  <SelectItem value="leasehold">Leasehold</SelectItem>
                </SelectContent>
              </Select>
              {errors.ownership && (
                <p className="text-sm text-red-500 mt-1">{errors.ownership.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gross_area_in_sqft">Area (sqft) *</Label>
              <Input
                id="gross_area_in_sqft"
                type="number"
                step="0.01"
                {...register('gross_area_in_sqft')}
                className={errors.gross_area_in_sqft ? 'border-red-500' : ''}
              />
              {errors.gross_area_in_sqft && (
                <p className="text-sm text-red-500 mt-1">{errors.gross_area_in_sqft.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="no_of_bedrooms">Bedrooms</Label>
              <Input
                id="no_of_bedrooms"
                type="number"
                {...register('no_of_bedrooms')}
              />
            </div>

            <div>
              <Label htmlFor="no_of_bathrooms">Bathrooms *</Label>
              <Input
                id="no_of_bathrooms"
                type="number"
                {...register('no_of_bathrooms')}
                className={errors.no_of_bathrooms ? 'border-red-500' : ''}
              />
              {errors.no_of_bathrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.no_of_bathrooms.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="no_of_parkings">Parkings</Label>
              <Input
                id="no_of_parkings"
                type="number"
                {...register('no_of_parkings')}
              />
            </div>

            <div>
              <Label htmlFor="basic_rent">Basic Rent (AED)</Label>
              <Input
                id="basic_rent"
                type="number"
                step="0.01"
                {...register('basic_rent')}
              />
            </div>

            <div>
              <Label htmlFor="basic_sale_value">Sale Value (AED)</Label>
              <Input
                id="basic_sale_value"
                type="number"
                step="0.01"
                {...register('basic_sale_value')}
              />
            </div>

            <div>
              <Label htmlFor="owned_by">Landlord</Label>
              <Select
                value={watch('owned_by') || 'none'}
                onValueChange={(value) => setValue('owned_by', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select landlord (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {landlords.map((landlord: any) => (
                    <SelectItem key={landlord.id} value={landlord.id.toString()}>
                      {landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="furnished_type">Furnished Type</Label>
              <Select
                value={watch('furnished_type') || 'none'}
                onValueChange={(value) => setValue('furnished_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnished type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="furnished">Furnished</SelectItem>
                  <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="listing_type">Listing Type</Label>
              <Select
                value={watch('listing_type')}
                onValueChange={(value) => setValue('listing_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Enter unit description..."
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
              {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : mode === 'create' ? 'Create Unit' : 'Update Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

