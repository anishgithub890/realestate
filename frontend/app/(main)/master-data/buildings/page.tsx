'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { BuildingForm } from '@/components/forms/building-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';

interface Building {
  id: number;
  name: string;
  area_id: number;
  location_id: string | null;
  completion_date: string | null;
  is_exempt: string;
  status: string;
  area?: {
    id: number;
    name: string;
    state?: {
      name: string;
      country?: {
        name: string;
      };
    };
  };
  location?: {
    id: string;
    name: string;
    full_path: string;
  };
  _count?: {
    units: number;
    floors: number;
  };
}

export default function BuildingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['buildings', searchTerm, currentPage],
    queryFn: () => api.get('/buildings', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/buildings/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Building deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteDialogOpen(false);
      setBuildingToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete building',
        variant: 'destructive',
      });
    },
  });

  const buildings: Building[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedBuilding(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete({ id: building.id, name: building.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (buildingToDelete) {
      deleteMutation.mutate(buildingToDelete.id);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    under_construction: 'bg-yellow-100 text-yellow-800',
  };

  const columns: Column<Building>[] = [
    {
      key: 'name',
      header: 'Building Name',
      sortable: true,
      render: (building) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{building.name}</div>
            {building.location && (
              <div className="text-xs text-muted-foreground">{building.location.full_path}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'area',
      header: 'Area',
      sortable: true,
      sortKey: 'area.name',
      render: (building) => (
        <div>
          <div className="text-sm">{building.area?.name || 'N/A'}</div>
          {building.area?.state && (
            <div className="text-xs text-muted-foreground">
              {building.area.state.name}
              {building.area.state.country && `, ${building.area.state.country.name}`}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (building) => (
        <Badge
          variant="outline"
          className={statusColors[building.status] || 'bg-gray-100 text-gray-800'}
        >
          {building.status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: 'counts',
      header: 'Counts',
      sortable: false,
      render: (building) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {building._count?.floors || 0} floors
          </Badge>
          <Badge variant="outline">
            {building._count?.units || 0} units
          </Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (building) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Building',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(building),
          },
          {
            label: 'Delete Building',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(building),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (building: Building) => (
    <Card key={building.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {building.name}
            </h3>
            {building.location && (
              <p className="text-sm text-muted-foreground">{building.location.full_path}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={statusColors[building.status] || 'bg-gray-100 text-gray-800'}
          >
            {building.status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {building.area && (
            <div className="text-sm">
              <span className="text-muted-foreground">Area: </span>
              <span className="font-medium">{building.area.name}</span>
              {building.area.state && (
                <span className="text-muted-foreground">, {building.area.state.name}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {building._count?.floors || 0} floors
            </Badge>
            <Badge variant="outline" className="text-xs">
              {building._count?.units || 0} units
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(building)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(building)}
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
          <h1 className="text-3xl font-bold text-gray-900">Buildings</h1>
          <p className="text-gray-600 mt-2">Manage buildings and their properties</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Building
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search buildings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={buildings}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No buildings found"
        pagination={
          pagination
            ? {
                currentPage: pagination.page || currentPage,
                totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
                onPageChange: setCurrentPage,
              }
            : undefined
        }
        defaultView="table"
        storageKey="buildings-view-mode"
        gridCols={3}
      />

      <BuildingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        building={selectedBuilding || undefined}
        mode={formMode}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Building"
        description={`Are you sure you want to delete "${buildingToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

