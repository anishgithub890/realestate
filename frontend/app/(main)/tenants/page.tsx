'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, User, Edit, Trash2, Phone, Mail, UserX, UserCheck } from 'lucide-react';
import { TenantForm } from '@/components/forms/tenant-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column, SortDirection } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { StatusToggleDialog } from '@/components/data-display/status-toggle-dialog';

interface Tenant {
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

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<{ id: number; name: string } | null>(null);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [tenantToToggle, setTenantToToggle] = useState<Tenant | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['tenants', searchTerm, currentPage, sortBy, sortOrder],
    queryFn: () => api.get('/tenants', {
      search: searchTerm,
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
    }),
  });

  // Backend returns: { success: true, data: [...tenants...], pagination: {...} }
  const tenants: Tenant[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleCreate = () => {
    setSelectedTenant(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete({ id: tenant.id, name: tenant.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      await api.delete(`/tenants/${tenantToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      });
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete tenant',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatusClick = (tenant: Tenant) => {
    setTenantToToggle(tenant);
    setStatusToggleDialogOpen(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!tenantToToggle) return;

    const newStatus = tenantToToggle.is_active === 'true' ? 'false' : 'true';
    const statusText = newStatus === 'true' ? 'activated' : 'deactivated';

    try {
      await api.put(`/tenants/${tenantToToggle.id}`, { is_active: newStatus });
      toast({
        title: 'Success',
        description: `Tenant ${statusText} successfully`,
      });
      setStatusToggleDialogOpen(false);
      setTenantToToggle(null);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${statusText} tenant`,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (tenant) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{tenant.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (tenant) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{tenant.email}</span>
        </div>
      ),
    },
    {
      key: 'mobile_no',
      header: 'Mobile',
      sortable: true,
      render: (tenant) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{tenant.mobile_no}</span>
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
      render: (tenant) => (
        <Badge variant="outline">{tenant.emirates_id}</Badge>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      sortKey: 'company.name',
      render: (tenant) => tenant.company?.name || 'N/A',
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (tenant) => (
        <Badge
          variant={tenant.is_active === 'true' ? 'default' : 'secondary'}
          className={
            tenant.is_active === 'true'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {tenant.is_active === 'true' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (tenant) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Tenant',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(tenant),
          },
          {
            label: tenant.is_active === 'true' ? 'Deactivate Tenant' : 'Activate Tenant',
            icon: tenant.is_active === 'true' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
            onClick: () => handleToggleStatusClick(tenant),
          },
        ];

        // Only add delete action if tenant is active
        if (tenant.is_active === 'true') {
          actions.push({
            label: 'Delete Tenant',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(tenant),
            variant: 'destructive',
          });
        }

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (tenant: Tenant): React.ReactNode => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{tenant.name}</h3>
            <p className="text-sm text-gray-600">{tenant.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Mobile:</span>
          <span className="font-medium">{tenant.mobile_no}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Nationality:</span>
          <span className="font-medium">{tenant.nationality}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Emirates ID:</span>
          <Badge variant="outline">{tenant.emirates_id}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Company:</span>
          <span className="font-medium">{tenant.company?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <Badge
            variant={tenant.is_active === 'true' ? 'default' : 'secondary'}
            className={
              tenant.is_active === 'true'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          >
            {tenant.is_active === 'true' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(tenant)}
          className="flex-1"
          title="Edit Tenant"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatusClick(tenant)}
          className={`flex-1 ${
            tenant.is_active === 'true'
              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
          }`}
          title={tenant.is_active === 'true' ? 'Deactivate Tenant' : 'Activate Tenant'}
        >
          {tenant.is_active === 'true' ? (
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
        {tenant.is_active === 'true' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(tenant)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Tenant"
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
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-2">Manage tenant information</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search tenants..."
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
          {/* Pagination Info */}
          {pagination && (
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing <span className="font-medium">{((pagination.page || 1) - 1) * (pagination.limit || 10) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pagination.page || 1) * (pagination.limit || 10), pagination.total || 0)}
                </span>{' '}
                of <span className="font-medium">{pagination.total || 0}</span> tenants
              </div>
              <div>
                Page <span className="font-medium">{pagination.page || 1}</span> of{' '}
                <span className="font-medium">{pagination.totalPages || 1}</span>
              </div>
            </div>
          )}

          <DataView
            data={tenants}
            columns={columns}
            renderGridItem={renderGridItem}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No tenants found"
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
            storageKey="tenants-view-mode"
          />
        </div>
      </div>

      <TenantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tenant={selectedTenant}
        mode={formMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Tenant"
        itemName={tenantToDelete?.name}
        description={`Are you sure you want to delete ${tenantToDelete?.name}? This action cannot be undone and will permanently remove this tenant and all associated data.`}
      />

      <StatusToggleDialog
        open={statusToggleDialogOpen}
        onOpenChange={setStatusToggleDialogOpen}
        onConfirm={handleToggleStatusConfirm}
        isActive={tenantToToggle?.is_active === 'true'}
        itemName={tenantToToggle?.name || ''}
      />
    </div>
  );
}
