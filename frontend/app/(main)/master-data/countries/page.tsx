'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Globe, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { MasterDataForm } from '@/components/forms/master-data-form';

interface Country {
  id: number;
  name: string;
  created_at: string;
  _count?: {
    states: number;
  };
}

export default function CountriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Country | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['master-data-countries', searchTerm, currentPage],
    queryFn: () => api.get('/master-data/countries', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/master-data/countries/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Country deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['master-data-countries'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete country',
        variant: 'destructive',
      });
    },
  });

  const countries: Country[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (item: Country) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: Country) => {
    setItemToDelete({ id: item.id, name: item.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const columns: Column<Country>[] = [
    {
      key: 'name',
      header: 'Country Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Globe className="h-4 w-4" />
          </div>
          <div className="font-medium">{item.name}</div>
        </div>
      ),
    },
    {
      key: 'states',
      header: 'States',
      sortable: false,
      render: (item) => (
        <Badge variant="secondary">
          {item._count?.states || 0} states
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (item) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Country',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(item),
          },
          {
            label: 'Delete Country',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(item),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (item: Country) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              {item.name}
            </h3>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Badge variant="secondary">
            {item._count?.states || 0} states
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(item)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(item)}
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
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-600 mt-2">Manage countries</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Country
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={countries}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No countries found"
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
        storageKey="countries-view-mode"
        gridCols={3}
      />

      <MasterDataForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={selectedItem || undefined}
        mode={formMode}
        type="country"
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Country"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

