'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, MapPin, User, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ViewingForm } from '@/components/forms/viewing-form';

interface Viewing {
  id: number;
  unit_id: number;
  tenant_id: number | null;
  viewing_date: string;
  viewing_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  unit?: {
    id: number;
    name: string;
  } | null;
  tenant?: {
    id: number;
    name: string;
  } | null;
}

export default function ViewingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewingToDelete, setViewingToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['viewings', searchTerm, currentPage],
    queryFn: () => api.get('/viewings', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const viewings: Viewing[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedViewing(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (viewing: Viewing) => {
    setSelectedViewing(viewing);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (viewing: Viewing) => {
    setViewingToDelete({ id: viewing.id, name: viewing.unit?.name || 'Viewing' });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!viewingToDelete) return;

    try {
      await api.delete(`/viewings/${viewingToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Viewing deleted successfully',
      });
      setDeleteDialogOpen(false);
      setViewingToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete viewing',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Viewing>[] = [
    {
      key: 'unit',
      header: 'Property',
      sortable: true,
      sortKey: 'unit.name',
      render: (viewing) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{viewing.unit?.name || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Unit #{viewing.unit_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Tenant',
      sortable: true,
      sortKey: 'tenant.name',
      render: (viewing) => (
        <div>
          {viewing.tenant ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{viewing.tenant.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'viewing_date',
      header: 'Date & Time',
      sortable: true,
      render: (viewing) => (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            {format(new Date(viewing.viewing_date), 'MMM dd, yyyy')}
          </div>
          <div className="text-xs text-muted-foreground">{viewing.viewing_time}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (viewing) => (
        <Badge variant="outline" className={getStatusColor(viewing.status)}>
          {viewing.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (viewing) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Viewing',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(viewing),
          },
          {
            label: 'Delete Viewing',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(viewing),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (viewing: Viewing) => (
    <Card key={viewing.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {viewing.unit?.name || 'N/A'}
            </h3>
            {viewing.tenant && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {viewing.tenant.name}
              </p>
            )}
          </div>
          <Badge variant="outline" className={getStatusColor(viewing.status)}>
            {viewing.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{format(new Date(viewing.viewing_date), 'MMM dd, yyyy')}</span>
            <span className="text-muted-foreground">at {viewing.viewing_time}</span>
          </div>

          {viewing.notes && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {viewing.notes}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(viewing)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(viewing)}
          >
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
          <h1 className="text-3xl font-bold text-gray-900">Property Viewings</h1>
          <p className="text-gray-600 mt-2">Schedule and manage property viewings</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Viewing
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search viewings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={viewings}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No viewings found"
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
        storageKey="viewings-view-mode"
        gridCols={3}
      />

      {/* Viewing Form Dialog */}
      <ViewingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        viewing={selectedViewing || undefined}
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
        title="Delete Viewing"
        description={`Are you sure you want to delete this viewing? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

