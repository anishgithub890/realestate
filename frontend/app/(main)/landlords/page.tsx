'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, User, Edit, Trash2, Phone, Mail, UserX, UserCheck } from 'lucide-react';
import { LandlordForm } from '@/components/forms/landlord-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column, SortDirection } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { StatusToggleDialog } from '@/components/data-display/status-toggle-dialog';

interface Landlord {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  mobile_no: string;
  emirates_id: string;
  nationality: string;
  residential: string;
  address: string;
  is_active: string;
  company_id: number;
  created_at: string;
  company?: {
    id: number;
    name: string;
  } | null;
}

export default function LandlordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [landlordToDelete, setLandlordToDelete] = useState<{ id: number; name: string } | null>(null);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [landlordToToggle, setLandlordToToggle] = useState<Landlord | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['landlords', searchTerm, currentPage, sortBy, sortOrder],
    queryFn: () => api.get('/landlords', {
      search: searchTerm,
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
    }),
  });

  // Backend returns: { success: true, data: [...landlords...], pagination: {...} }
  const landlords: Landlord[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleCreate = () => {
    setSelectedLandlord(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (landlord: Landlord) => {
    setSelectedLandlord(landlord);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (landlord: Landlord) => {
    setLandlordToDelete({ id: landlord.id, name: landlord.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!landlordToDelete) return;

    try {
      await api.delete(`/landlords/${landlordToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Landlord deleted successfully',
      });
      setDeleteDialogOpen(false);
      setLandlordToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete landlord',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatusClick = (landlord: Landlord) => {
    setLandlordToToggle(landlord);
    setStatusToggleDialogOpen(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!landlordToToggle) return;

    const newStatus = landlordToToggle.is_active === 'true' ? 'false' : 'true';
    const statusText = newStatus === 'true' ? 'activated' : 'deactivated';

    try {
      await api.put(`/landlords/${landlordToToggle.id}`, { is_active: newStatus });
      toast({
        title: 'Success',
        description: `Landlord ${statusText} successfully`,
      });
      setStatusToggleDialogOpen(false);
      setLandlordToToggle(null);
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${statusText} landlord`,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Landlord>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (landlord) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{landlord.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (landlord) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{landlord.email}</span>
        </div>
      ),
    },
    {
      key: 'mobile_no',
      header: 'Mobile',
      sortable: true,
      render: (landlord) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{landlord.mobile_no}</span>
        </div>
      ),
    },
    {
      key: 'nationality',
      header: 'Nationality',
      sortable: true,
    },
    {
      key: 'emirates_id',
      header: 'Emirates ID',
      sortable: true,
      render: (landlord) => (
        <Badge variant="outline">{landlord.emirates_id}</Badge>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      sortKey: 'company.name',
      render: (landlord) => landlord.company?.name || 'N/A',
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (landlord) => (
        <Badge
          variant={landlord.is_active === 'true' ? 'default' : 'secondary'}
          className={
            landlord.is_active === 'true'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {landlord.is_active === 'true' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (landlord) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Landlord',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(landlord),
          },
          {
            label: landlord.is_active === 'true' ? 'Deactivate Landlord' : 'Activate Landlord',
            icon: landlord.is_active === 'true' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
            onClick: () => handleToggleStatusClick(landlord),
          },
        ];

        // Only add delete action if landlord is active
        if (landlord.is_active === 'true') {
          actions.push({
            label: 'Delete Landlord',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(landlord),
            variant: 'destructive',
          });
        }

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (landlord: Landlord): React.ReactNode => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{landlord.name}</h3>
            <p className="text-sm text-gray-600">{landlord.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Mobile:</span>
          <span className="font-medium">{landlord.mobile_no}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Nationality:</span>
          <span className="font-medium">{landlord.nationality}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Emirates ID:</span>
          <Badge variant="outline">{landlord.emirates_id}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Company:</span>
          <span className="font-medium">{landlord.company?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <Badge
            variant={landlord.is_active === 'true' ? 'default' : 'secondary'}
            className={
              landlord.is_active === 'true'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          >
            {landlord.is_active === 'true' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(landlord)}
          className="flex-1"
          title="Edit Landlord"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatusClick(landlord)}
          className={`flex-1 ${
            landlord.is_active === 'true'
              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
          }`}
          title={landlord.is_active === 'true' ? 'Deactivate Landlord' : 'Activate Landlord'}
        >
          {landlord.is_active === 'true' ? (
            <>
              <UserX className="h-3 w-3 mr-1" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3 mr-1" />
              Activate
            </>
          )}
        </Button>
        {landlord.is_active === 'true' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(landlord)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Landlord"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landlords</h1>
          <p className="text-gray-600 mt-2">Manage landlord information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Landlord
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search landlords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4">
          <DataView
            data={landlords}
            columns={columns}
            renderGridItem={renderGridItem}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No landlords found"
            pagination={
              pagination
                ? {
                    currentPage: pagination.page || 1,
                    totalPages: pagination.totalPages || 1,
                    onPageChange: (page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                  }
                : undefined
            }
            onSort={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
            }}
            defaultView="table"
            gridCols={3}
            showViewSwitcher={true}
            storageKey="landlords-view-mode"
          />
        </div>
      </div>

      <LandlordForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        landlord={selectedLandlord}
        mode={formMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Landlord"
        itemName={landlordToDelete?.name}
        description={`Are you sure you want to delete ${landlordToDelete?.name}? This action cannot be undone and will permanently remove this landlord and all associated data.`}
      />

      <StatusToggleDialog
        open={statusToggleDialogOpen}
        onOpenChange={setStatusToggleDialogOpen}
        onConfirm={handleToggleStatusConfirm}
        isActive={landlordToToggle?.is_active === 'true'}
        itemName={landlordToToggle?.name || ''}
      />
    </div>
  );
}
