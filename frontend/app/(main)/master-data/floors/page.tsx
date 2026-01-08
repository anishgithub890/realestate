'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Layers, Edit, Trash2 } from 'lucide-react';
import { FloorForm } from '@/components/forms/floor-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';

interface Floor {
  id: number;
  name: string;
  building_id: number;
  building?: {
    id: number;
    name: string;
    area?: {
      name: string;
    };
  };
  _count?: {
    units: number;
  };
}

export default function FloorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['floors', searchTerm, currentPage],
    queryFn: () => api.get('/floors', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/floors/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Floor deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteDialogOpen(false);
      setFloorToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete floor',
        variant: 'destructive',
      });
    },
  });

  const floors: Floor[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedFloor(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (floor: Floor) => {
    setSelectedFloor(floor);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (floor: Floor) => {
    setFloorToDelete({ id: floor.id, name: floor.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (floorToDelete) {
      deleteMutation.mutate(floorToDelete.id);
    }
  };

  const columns: Column<Floor>[] = [
    {
      key: 'name',
      header: 'Floor Name',
      sortable: true,
      render: (floor) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Layers className="h-4 w-4" />
          </div>
          <div className="font-medium">{floor.name}</div>
        </div>
      ),
    },
    {
      key: 'building',
      header: 'Building',
      sortable: true,
      sortKey: 'building.name',
      render: (floor) => (
        <div>
          <div className="text-sm">{floor.building?.name || 'N/A'}</div>
          {floor.building?.area && (
            <div className="text-xs text-muted-foreground">{floor.building.area.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'units',
      header: 'Units',
      sortable: false,
      render: (floor) => (
        <Badge variant="secondary">
          {floor._count?.units || 0} units
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (floor) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Floor',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(floor),
          },
          {
            label: 'Delete Floor',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(floor),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (floor: Floor) => (
    <Card key={floor.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              {floor.name}
            </h3>
            {floor.building && (
              <p className="text-sm text-muted-foreground">{floor.building.name}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {floor.building?.area && (
            <div className="text-sm">
              <span className="text-muted-foreground">Area: </span>
              <span className="font-medium">{floor.building.area.name}</span>
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {floor._count?.units || 0} units
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(floor)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(floor)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Container className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Floors</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage building floors</p>
        </div>
        <Button size="sm" className="text-xs sm:text-sm" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Floor</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search floors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <DataView
          data={floors}
          columns={columns}
          renderGridItem={renderGridItem}
          isLoading={isLoading}
          error={error}
          emptyMessage="No floors found"
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
          storageKey="floors-view-mode"
          gridCols={3}
        />
      </div>

      <FloorForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        floor={selectedFloor || undefined}
        mode={formMode}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Floor"
        description={`Are you sure you want to delete "${floorToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
}

