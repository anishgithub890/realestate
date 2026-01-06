'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MessageSquare, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Complaint {
  id: number;
  complaint_no: string;
  type: string;
  title: string;
  description: string;
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

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<{ id: number; complaint_no: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['complaints', searchTerm, currentPage],
    queryFn: () => api.get('/complaints', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const complaints: Complaint[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleDeleteClick = (complaint: Complaint) => {
    setComplaintToDelete({ id: complaint.id, complaint_no: complaint.complaint_no });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;

    try {
      await api.delete(`/complaints/${complaintToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Complaint deleted successfully',
      });
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete complaint',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Complaint>[] = [
    {
      key: 'complaint_no',
      header: 'Complaint No',
      sortable: true,
      render: (complaint) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="font-medium">{complaint.complaint_no}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (complaint) => (
        <Badge
          variant={complaint.type === 'complaint' ? 'destructive' : 'default'}
          className={
            complaint.type === 'complaint'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }
        >
          {complaint.type}
        </Badge>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (complaint) => (
        <div className="font-medium">{complaint.title}</div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (complaint) => (
        <div className="text-sm text-muted-foreground max-w-md truncate">
          {complaint.description}
        </div>
      ),
    },
    {
      key: 'submitted_by',
      header: 'Submitted By',
      sortable: true,
      sortKey: 'tenant.name',
      render: (complaint) => (
        <div>
          {complaint.tenant ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{complaint.tenant.name}</span>
            </div>
          ) : complaint.landlord ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{complaint.landlord.name}</span>
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
      render: (complaint) => (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          {complaint.status?.name || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (complaint) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'View Complaint',
            icon: ActionIcons.View,
            onClick: () => {
              // TODO: Implement view complaint dialog
            },
          },
          {
            label: 'Delete Complaint',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(complaint),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (complaint: Complaint) => (
    <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              {complaint.complaint_no}
            </h3>
            <Badge
              variant={complaint.type === 'complaint' ? 'destructive' : 'default'}
              className={
                complaint.type === 'complaint'
                  ? 'bg-red-100 text-red-800 mt-1'
                  : 'bg-blue-100 text-blue-800 mt-1'
              }
            >
              {complaint.type}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {complaint.status?.name || 'N/A'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="font-medium">{complaint.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {complaint.description}
          </p>

          {complaint.tenant && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Tenant: {complaint.tenant.name}</span>
            </div>
          )}

          {complaint.landlord && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Landlord: {complaint.landlord.name}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Implement view complaint
            }}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(complaint)}
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
          <h1 className="text-3xl font-bold text-gray-900">Complaints & Suggestions</h1>
          <p className="text-gray-600 mt-2">Manage tenant and landlord complaints</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={complaints}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No complaints found"
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
        storageKey="complaints-view-mode"
        gridCols={3}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Complaint"
        description={`Are you sure you want to delete complaint "${complaintToDelete?.complaint_no}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
