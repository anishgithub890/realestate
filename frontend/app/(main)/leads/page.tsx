'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, Mail, UserCheck, TrendingUp } from 'lucide-react';
import { LeadForm } from '@/components/forms/lead-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Lead {
  id: number;
  uuid: string;
  name: string;
  email: string;
  mobile_no: string;
  whatsapp_no: string | null;
  property_type: string;
  interest_type: string;
  min_price: number;
  max_price: number;
  description: string | null;
  address: string | null;
  status_id: number | null;
  activity_source_id: number;
  assigned_to: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  status?: {
    id: number;
    name: string;
    category: string;
  } | null;
  activity_source?: {
    id: number;
    name: string;
  } | null;
  assigned_user?: {
    id: number;
    name: string;
  } | null;
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['leads', searchTerm, statusFilter, currentPage],
    queryFn: () => api.get('/leads', { 
      search: searchTerm, 
      status_id: statusFilter !== 'all' ? statusFilter : undefined,
      page: currentPage, 
      limit: 10 
    }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: number; userId: number | null }) =>
      api.post(`/leads/${leadId}/assign`, { user_id: userId }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lead assigned successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign lead',
        variant: 'destructive',
      });
    },
  });

  // Backend returns: { success: true, data: [...leads...], pagination: {...} }
  const leads: Lead[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  // Fetch lead statuses for filter
  const { data: statusesData } = useQuery<any>({
    queryKey: ['lead-statuses'],
    queryFn: () => api.get('/leads/stats'),
  });

  const handleCreate = () => {
    setSelectedLead(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete({ id: lead.id, name: lead.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      await api.delete(`/leads/${leadToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const handleAssign = async (lead: Lead, userId: number | null) => {
    assignMutation.mutate({ leadId: lead.id, userId });
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Lead Name',
      sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="text-xs text-muted-foreground">#{lead.uuid.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: false,
      render: (lead) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm gap-1">
            <Mail className="w-3 h-3 text-muted-foreground" />
            {lead.email}
          </div>
          <div className="flex items-center text-sm gap-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            {lead.mobile_no}
          </div>
        </div>
      ),
    },
    {
      key: 'property_type',
      header: 'Property Type',
      sortable: true,
      render: (lead) => (
        <Badge variant="outline">{lead.property_type}</Badge>
      ),
    },
    {
      key: 'interest_type',
      header: 'Interest',
      sortable: true,
      render: (lead) => (
        <Badge variant="secondary">{lead.interest_type}</Badge>
      ),
    },
    {
      key: 'price_range',
      header: 'Price Range',
      sortable: true,
      sortKey: 'min_price',
      render: (lead) => (
        <div className="text-sm">
          <div className="font-medium">
            AED {lead.min_price?.toLocaleString()} - {lead.max_price?.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortKey: 'status.name',
      render: (lead) => (
        <Badge
          variant={
            lead.status?.category === 'qualified'
              ? 'default'
              : lead.status?.category === 'converted'
              ? 'default'
              : 'outline'
          }
          className={
            lead.status?.category === 'qualified'
              ? 'bg-green-100 text-green-800'
              : lead.status?.category === 'converted'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }
        >
          {lead.status?.name || 'New'}
        </Badge>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      sortKey: 'activity_source.name',
      render: (lead) => (
        <div>
          <div className="text-sm">{lead.activity_source?.name || 'N/A'}</div>
          {lead.utm_source && (
            <div className="text-xs text-muted-foreground">UTM: {lead.utm_source}</div>
          )}
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      sortable: true,
      sortKey: 'assigned_user.name',
      render: (lead) => (
        <div>
          {lead.assigned_user ? (
            <Badge variant="secondary">{lead.assigned_user.name}</Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Unassigned
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (lead) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Lead',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(lead),
          },
          {
            label: 'Delete Lead',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(lead),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (lead: Lead) => (
    <Card key={lead.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{lead.name}</h3>
            <p className="text-xs text-muted-foreground">#{lead.uuid.slice(0, 8)}</p>
          </div>
          <Badge
            variant={
              lead.status?.category === 'qualified'
                ? 'default'
                : lead.status?.category === 'converted'
                ? 'default'
                : 'outline'
            }
            className={
              lead.status?.category === 'qualified'
                ? 'bg-green-100 text-green-800'
                : lead.status?.category === 'converted'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {lead.status?.name || 'New'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{lead.mobile_no}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{lead.property_type}</Badge>
            <Badge variant="secondary">{lead.interest_type}</Badge>
          </div>

          <div className="text-sm">
            <span className="font-medium">
              AED {lead.min_price?.toLocaleString()} - {lead.max_price?.toLocaleString()}
            </span>
          </div>

          {lead.assigned_user ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned: </span>
              <span className="font-medium">{lead.assigned_user.name}</span>
            </div>
          ) : (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Unassigned
            </Badge>
          )}

          {lead.activity_source && (
            <div className="text-xs text-muted-foreground">
              Source: {lead.activity_source.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(lead)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(lead)}
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
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage property inquiries and leads</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusesData?.data?.statuses?.map((status: any) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataView
        data={leads}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No leads found"
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
        storageKey="leads-view-mode"
        gridCols={3}
      />

      {/* Lead Form Dialog */}
      <LeadForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lead={selectedLead || undefined}
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
        title="Delete Lead"
        description={`Are you sure you want to delete lead "${leadToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
