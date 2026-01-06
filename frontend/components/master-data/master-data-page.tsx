'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { MasterDataForm } from '@/components/forms/master-data-form';

interface MasterDataPageProps {
  title: string;
  description: string;
  endpoint: string;
  queryKey: string;
  icon: React.ComponentType<{ className?: string }>;
  columns: Column<any>[];
  renderGridItem?: (item: any) => React.ReactNode;
  getCountLabel?: (item: any) => string;
}

export function MasterDataPage({
  title,
  description,
  endpoint,
  queryKey,
  icon: Icon,
  columns,
  renderGridItem,
  getCountLabel,
}: MasterDataPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: [queryKey, searchTerm, currentPage],
    queryFn: () => api.get(endpoint, { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `${title.slice(0, -1)} deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to delete ${title.slice(0, -1).toLowerCase()}`,
        variant: 'destructive',
      });
    },
  });

  const items: any[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete({ id: item.id, name: item.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const defaultRenderGridItem = (item: any) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Icon className="w-5 h-5 text-blue-600" />
              {item.name}
            </h3>
          </div>
        </div>

        {getCountLabel && (
          <div className="space-y-2 mb-4">
            <Badge variant="secondary">
              {getCountLabel(item)}
            </Badge>
          </div>
        )}

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

  const finalColumns: Column<any>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (item: any) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: `Edit ${title.slice(0, -1)}`,
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(item),
          },
          {
            label: `Delete ${title.slice(0, -1)}`,
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(item),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const typeName = endpoint.split('/').pop()?.replace(/-/g, '-') || 'item';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={items}
        columns={finalColumns}
        renderGridItem={renderGridItem || defaultRenderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage={`No ${title.toLowerCase()} found`}
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
        storageKey={`${queryKey}-view-mode`}
        gridCols={3}
      />

      <MasterDataForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={selectedItem || undefined}
        mode={formMode}
        type={typeName}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${title.slice(0, -1)}`}
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

