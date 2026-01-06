'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserCheck, Award, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';

interface Broker {
  id: number;
  name: string;
  email: string;
  mobile_no: string;
  rera_license: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

export default function BrokersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['brokers', searchTerm, currentPage],
    queryFn: () => api.get('/brokers', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const brokers: Broker[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedBroker(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (broker: Broker) => {
    setSelectedBroker(broker);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (broker: Broker) => {
    setBrokerToDelete({ id: broker.id, name: broker.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brokerToDelete) return;

    try {
      await api.delete(`/brokers/${brokerToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Broker deleted successfully',
      });
      setDeleteDialogOpen(false);
      setBrokerToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete broker',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Broker>[] = [
    {
      key: 'name',
      header: 'Broker Name',
      sortable: true,
      render: (broker) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{broker.name}</div>
            <div className="text-xs text-muted-foreground">{broker.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'mobile_no',
      header: 'Contact',
      sortable: true,
      render: (broker) => <div className="text-sm">{broker.mobile_no}</div>,
    },
    {
      key: 'rera_license',
      header: 'RERA License',
      sortable: true,
      render: (broker) => (
        <div>
          {broker.rera_license ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {broker.rera_license}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Not Provided
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'commission_rate',
      header: 'Commission Rate',
      sortable: true,
      render: (broker) => (
        <div className="text-sm font-medium">{broker.commission_rate}%</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (broker) => (
        <Badge
          variant={broker.is_active ? 'default' : 'destructive'}
          className={
            broker.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        >
          {broker.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (broker) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Broker',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(broker),
          },
          {
            label: 'Delete Broker',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(broker),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (broker: Broker) => (
    <Card key={broker.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              {broker.name}
            </h3>
            <p className="text-sm text-muted-foreground">{broker.email}</p>
          </div>
          <Badge
            variant={broker.is_active ? 'default' : 'destructive'}
            className={
              broker.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {broker.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Mobile: </span>
            <span className="font-medium">{broker.mobile_no}</span>
          </div>

          {broker.rera_license && (
            <div className="text-sm">
              <span className="text-muted-foreground">RERA: </span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {broker.rera_license}
              </Badge>
            </div>
          )}

          <div className="text-sm">
            <span className="text-muted-foreground">Commission: </span>
            <span className="font-medium">{broker.commission_rate}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(broker)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(broker)}
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
          <h1 className="text-3xl font-bold text-gray-900">Brokers</h1>
          <p className="text-gray-600 mt-2">Manage real estate brokers and agents</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Broker
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search brokers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={brokers}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No brokers found"
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
        storageKey="brokers-view-mode"
        gridCols={3}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Broker"
        description={`Are you sure you want to delete broker "${brokerToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

