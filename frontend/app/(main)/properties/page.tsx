'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Building2, Edit, Trash2, MapPin, Bed, Bath, Car } from 'lucide-react';
import { UnitForm } from '@/components/forms/unit-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';

interface Unit {
  id: number;
  name: string;
  gross_area_in_sqft: number;
  ownership: string;
  basic_rent: number | null;
  basic_sale_value: number | null;
  premise_no: string;
  status: string;
  property_type: string;
  no_of_bathrooms: number;
  no_of_bedrooms: number | null;
  no_of_parkings: number | null;
  building_id: number;
  floor_id: number;
  unit_type_id: number;
  owned_by: number | null;
  building?: {
    id: number;
    name: string;
    area?: {
      name: string;
    };
  };
  floor?: {
    id: number;
    name: string;
  };
  unit_type?: {
    id: number;
    name: string;
  };
  landlord?: {
    id: number;
    name: string;
  };
}

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['units', searchTerm, currentPage],
    queryFn: () => api.get('/properties/units', { search: searchTerm, page: currentPage, limit: 10 }),
  });

  // Backend returns: { success: true, data: [...units...], pagination: {...} }
  const units: Unit[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedUnit(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete({ id: unit.id, name: unit.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      await api.delete(`/properties/units/${unitToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Unit deleted successfully',
      });
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete unit',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Unit>[] = [
    {
      key: 'name',
      header: 'Unit Name',
      sortable: true,
      render: (unit) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{unit.name}</div>
            <div className="text-xs text-muted-foreground">{unit.premise_no}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'building',
      header: 'Location',
      sortable: true,
      sortKey: 'building.name',
      render: (unit) => (
        <div>
          <div className="font-medium">{unit.building?.name || 'N/A'}</div>
          {unit.building?.area && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {unit.building.area.name}
            </div>
          )}
          {unit.floor && (
            <div className="text-xs text-muted-foreground">Floor: {unit.floor.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'property_type',
      header: 'Type',
      sortable: true,
      render: (unit) => (
        <div>
          <Badge variant="outline">{unit.property_type}</Badge>
          {unit.unit_type && (
            <div className="text-xs text-muted-foreground mt-1">{unit.unit_type.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      sortable: false,
      render: (unit) => (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span>{unit.no_of_bedrooms || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-muted-foreground" />
            <span>{unit.no_of_bathrooms}</span>
          </div>
          {unit.no_of_parkings && (
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span>{unit.no_of_parkings}</span>
            </div>
          )}
          <div className="text-muted-foreground">
            {unit.gross_area_in_sqft} sqft
          </div>
        </div>
      ),
    },
    {
      key: 'pricing',
      header: 'Pricing',
      sortable: true,
      sortKey: 'basic_rent',
      render: (unit) => (
        <div>
          {unit.basic_rent && (
            <div className="font-medium">AED {unit.basic_rent.toLocaleString()}/mo</div>
          )}
          {unit.basic_sale_value && (
            <div className="text-xs text-muted-foreground">
              Sale: AED {unit.basic_sale_value.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (unit) => {
        const statusColors: Record<string, string> = {
          available: 'bg-green-100 text-green-800',
          rented: 'bg-blue-100 text-blue-800',
          sold: 'bg-purple-100 text-purple-800',
          maintenance: 'bg-orange-100 text-orange-800',
        };

        return (
          <Badge
            variant="outline"
            className={statusColors[unit.status] || 'bg-gray-100 text-gray-800'}
          >
            {unit.status}
          </Badge>
        );
      },
    },
    {
      key: 'landlord',
      header: 'Landlord',
      sortable: true,
      sortKey: 'landlord.name',
      render: (unit) => (
        <div>
          {unit.landlord ? (
            <span className="text-sm">{unit.landlord.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (unit) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Unit',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(unit),
          },
          {
            label: 'Delete Unit',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(unit),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (unit: Unit) => (
    <Card key={unit.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{unit.name}</h3>
            <p className="text-sm text-muted-foreground">{unit.premise_no}</p>
          </div>
          <Badge
            variant="outline"
            className={
              unit.status === 'available'
                ? 'bg-green-100 text-green-800'
                : unit.status === 'rented'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }
          >
            {unit.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{unit.building?.name}</span>
            {unit.floor && <span className="text-muted-foreground">• {unit.floor.name}</span>}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span>{unit.no_of_bedrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span>{unit.no_of_bathrooms}</span>
            </div>
            {unit.no_of_parkings && (
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span>{unit.no_of_parkings}</span>
              </div>
            )}
            <span className="text-muted-foreground">{unit.gross_area_in_sqft} sqft</span>
          </div>

          {unit.basic_rent && (
            <div className="font-semibold text-lg">
              AED {unit.basic_rent.toLocaleString()}/mo
            </div>
          )}

          {unit.landlord && (
            <div className="text-sm text-muted-foreground">
              Landlord: {unit.landlord.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(unit)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(unit)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage properties and units</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={units}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No properties found"
        pagination={
          pagination
            ? {
                currentPage: pagination.page || currentPage,
                totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
                onPageChange: setCurrentPage,
              }
            : undefined
        }
        defaultView="table"
        storageKey="properties-view-mode"
        gridCols={3}
      />

      {/* Unit Form Dialog */}
      <UnitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        unit={selectedUnit || undefined}
        mode={formMode}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Unit"
        description={`Are you sure you want to delete "${unitToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
