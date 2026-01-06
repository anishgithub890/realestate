'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FolderOpen, User, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Request {
  id: number;
  request_no: string;
  description: string;
  type?: {
    id: number;
    name: string;
  } | null;
  status?: {
    id: number;
    name: string;
  } | null;
  tenant?: {
    id: number;
    name: string;
  } | null;
  landlord?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<{ id: number; request_no: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['requests', searchTerm, currentPage],
    queryFn: () => api.get('/requests', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const requests: Request[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleDeleteClick = (request: Request) => {
    setRequestToDelete({ id: request.id, request_no: request.request_no });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;

    try {
      await api.delete(`/requests/${requestToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Request deleted successfully',
      });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete request',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Request>[] = [
    {
      key: 'request_no',
      header: 'Request No',
      sortable: true,
      render: (request) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div className="font-medium">{request.request_no}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortKey: 'type.name',
      render: (request) => (
        <Badge variant="outline">{request.type?.name || 'N/A'}</Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (request) => (
        <div className="text-sm text-muted-foreground max-w-md truncate">
          {request.description}
        </div>
      ),
    },
    {
      key: 'submitted_by',
      header: 'Submitted By',
      sortable: true,
      sortKey: 'tenant.name',
      render: (request) => (
        <div>
          {request.tenant ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{request.tenant.name}</span>
            </div>
          ) : request.landlord ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{request.landlord.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortKey: 'status.name',
      render: (request) => (
        <Badge variant="outline" className={getStatusColor(request.status?.name)}>
          {request.status?.name || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (request) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'View Request',
            icon: ActionIcons.View,
            onClick: () => {
              // TODO: Implement view request dialog
            },
          },
          {
            label: 'Delete Request',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(request),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (request: Request) => (
    <Card key={request.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-cyan-600" />
              {request.request_no}
            </h3>
            {request.type && (
              <Badge variant="outline" className="mt-1">
                {request.type.name}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={getStatusColor(request.status?.name)}>
            {request.status?.name || 'N/A'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {request.description}
          </p>

          {request.tenant && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Tenant: {request.tenant.name}</span>
            </div>
          )}

          {request.landlord && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Landlord: {request.landlord.name}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {format(new Date(request.created_at), 'MMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Implement view request
            }}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(request)}
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
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <p className="text-gray-600 mt-2">Manage tenant and landlord requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={requests}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No requests found"
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
        storageKey="requests-view-mode"
        gridCols={3}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Request"
        description={`Are you sure you want to delete request "${requestToDelete?.request_no}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

