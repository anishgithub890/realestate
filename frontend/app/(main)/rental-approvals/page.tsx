'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, CheckCircle2, XCircle, Clock, Building2, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { RentalApprovalForm } from '@/components/forms/rental-approval-form';
import { ApprovalActionDialog } from '@/components/rental-approvals/approval-action-dialog';
import { format } from 'date-fns';

interface RentalApproval {
  id: number;
  request_no: string;
  unit_id: number;
  tenant_id: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string | null;
  created_at: string;
  unit?: {
    id: number;
    name: string;
  } | null;
  tenant?: {
    id: number;
    name: string;
    email: string;
  } | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  approver?: {
    id: number;
    name: string;
  } | null;
}

export default function RentalApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<RentalApproval | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<{ id: number; request_no: string } | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['rental-approvals', searchTerm, statusFilter, currentPage],
    queryFn: () => api.get('/rental-approvals', { 
      search: searchTerm, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: currentPage, 
      limit: 20 
    }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      api.post(`/rental-approvals/${id}/approve`, { remarks }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Rental approval approved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['rental-approvals'] });
      setActionDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to approve rental approval',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      api.post(`/rental-approvals/${id}/reject`, { remarks }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Rental approval rejected successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['rental-approvals'] });
      setActionDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reject rental approval',
        variant: 'destructive',
      });
    },
  });

  const approvals: RentalApproval[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedApproval(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (approval: RentalApproval) => {
    setSelectedApproval(approval);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (approval: RentalApproval) => {
    setApprovalToDelete({ id: approval.id, request_no: approval.request_no });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!approvalToDelete) return;

    try {
      await api.delete(`/rental-approvals/${approvalToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Rental approval deleted successfully',
      });
      setDeleteDialogOpen(false);
      setApprovalToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete rental approval',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = (approval: RentalApproval) => {
    setSelectedApproval(approval);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (approval: RentalApproval) => {
    setSelectedApproval(approval);
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const handleActionConfirm = (remarks?: string) => {
    if (!selectedApproval) return;

    if (actionType === 'approve') {
      approveMutation.mutate({ id: selectedApproval.id, remarks });
    } else if (actionType === 'reject') {
      rejectMutation.mutate({ id: selectedApproval.id, remarks });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const columns: Column<RentalApproval>[] = [
    {
      key: 'request_no',
      header: 'Request No',
      sortable: true,
      render: (approval) => (
        <div className="font-medium">{approval.request_no}</div>
      ),
    },
    {
      key: 'unit',
      header: 'Property',
      sortable: true,
      sortKey: 'unit.name',
      render: (approval) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{approval.unit?.name || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Unit #{approval.unit_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Tenant',
      sortable: true,
      sortKey: 'tenant.name',
      render: (approval) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{approval.tenant?.name || 'N/A'}</div>
            {approval.tenant?.email && (
              <div className="text-xs text-muted-foreground">{approval.tenant.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (approval) => (
        <Badge variant="outline" className={getStatusColor(approval.status)}>
          <span className="flex items-center gap-1">
            {getStatusIcon(approval.status)}
            {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          </span>
        </Badge>
      ),
    },
    {
      key: 'approver',
      header: 'Approved By',
      sortable: true,
      sortKey: 'approver.name',
      render: (approval) => (
        <div>
          {approval.approver ? (
            <div className="text-sm">{approval.approver.name}</div>
          ) : (
            <span className="text-sm text-muted-foreground">Pending</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (approval) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(approval.created_at), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (approval) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [];

        if (approval.status === 'pending') {
          actions.push(
            {
              label: 'Approve',
              icon: <CheckCircle2 className="w-4 h-4" />,
              onClick: () => handleApprove(approval),
            },
            {
              label: 'Reject',
              icon: <XCircle className="w-4 h-4" />,
              onClick: () => handleReject(approval),
              variant: 'destructive',
            }
          );
        }

        actions.push(
          {
            label: 'Edit',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(approval),
          },
          {
            label: 'Delete',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(approval),
            variant: 'destructive',
          }
        );

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (approval: RentalApproval) => (
    <Card key={approval.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{approval.request_no}</h3>
            <Badge variant="outline" className={getStatusColor(approval.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(approval.status)}
                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </span>
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{approval.unit?.name || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{approval.tenant?.name || 'N/A'}</span>
          </div>

          {approval.approver && (
            <div className="text-xs text-muted-foreground">
              Approved by: {approval.approver.name}
            </div>
          )}

          {approval.remarks && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {approval.remarks}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {format(new Date(approval.created_at), 'MMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {approval.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleApprove(approval)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleReject(approval)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {approval.status !== 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(approval)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDeleteClick(approval)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Approvals</h1>
          <p className="text-gray-600 mt-2">Manage rental approval requests</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Approval Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataView
        data={approvals}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No rental approvals found"
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
        storageKey="rental-approvals-view-mode"
        gridCols={3}
      />

      {/* Rental Approval Form Dialog */}
      <RentalApprovalForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        approval={selectedApproval || undefined}
        mode={formMode}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      {/* Approval Action Dialog */}
      <ApprovalActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        type={actionType}
        onConfirm={handleActionConfirm}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Rental Approval"
        description={`Are you sure you want to delete "${approvalToDelete?.request_no}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

