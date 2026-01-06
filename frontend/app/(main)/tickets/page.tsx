'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Ticket, AlertCircle, User, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Ticket {
  id: number;
  ticket_no: string;
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
  unit?: {
    id: number;
    name: string;
  } | null;
  assigned_user?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ id: number; ticket_no: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['tickets', searchTerm, currentPage],
    queryFn: () => api.get('/tickets', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const tickets: Ticket[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete({ id: ticket.id, ticket_no: ticket.ticket_no });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;

    try {
      await api.delete(`/tickets/${ticketToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Ticket deleted successfully',
      });
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'ticket_no',
      header: 'Ticket No',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Ticket className="h-4 w-4" />
          </div>
          <div className="font-medium">{ticket.ticket_no}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortKey: 'type.name',
      render: (ticket) => (
        <Badge variant="outline">{ticket.type?.name || 'N/A'}</Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false,
      render: (ticket) => (
        <div className="text-sm text-muted-foreground max-w-md truncate">
          {ticket.description}
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Tenant/Landlord',
      sortable: true,
      sortKey: 'tenant.name',
      render: (ticket) => (
        <div>
          {ticket.tenant ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{ticket.tenant.name}</span>
            </div>
          ) : ticket.landlord ? (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{ticket.landlord.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Property',
      sortable: true,
      sortKey: 'unit.name',
      render: (ticket) => (
        <div>
          {ticket.unit ? (
            <div className="flex items-center gap-1 text-sm">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span>{ticket.unit.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      sortable: true,
      sortKey: 'assigned_user.name',
      render: (ticket) => (
        <div>
          {ticket.assigned_user ? (
            <Badge variant="secondary">{ticket.assigned_user.name}</Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Unassigned
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortKey: 'status.name',
      render: (ticket) => (
        <Badge variant="outline" className={getStatusColor(ticket.status?.name)}>
          {ticket.status?.name || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (ticket) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'View Ticket',
            icon: ActionIcons.View,
            onClick: () => {
              // TODO: Implement view ticket dialog
            },
          },
          {
            label: 'Delete Ticket',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(ticket),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (ticket: Ticket) => (
    <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-600" />
              {ticket.ticket_no}
            </h3>
            {ticket.type && (
              <Badge variant="outline" className="mt-1">
                {ticket.type.name}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={getStatusColor(ticket.status?.name)}>
            {ticket.status?.name || 'N/A'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ticket.description}
          </p>

          {ticket.tenant && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Tenant: {ticket.tenant.name}</span>
            </div>
          )}

          {ticket.landlord && (
            <div className="flex items-center gap-1 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Landlord: {ticket.landlord.name}</span>
            </div>
          )}

          {ticket.unit && (
            <div className="flex items-center gap-1 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span>{ticket.unit.name}</span>
            </div>
          )}

          {ticket.assigned_user ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned: </span>
              <span className="font-medium">{ticket.assigned_user.name}</span>
            </div>
          ) : (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Unassigned
            </Badge>
          )}

          <div className="text-xs text-muted-foreground">
            {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Implement view ticket
            }}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(ticket)}
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
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600 mt-2">Manage maintenance tickets</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={tickets}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No tickets found"
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
        storageKey="tickets-view-mode"
        gridCols={3}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Ticket"
        description={`Are you sure you want to delete ticket "${ticketToDelete?.ticket_no}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
