'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, User, Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import { UserForm } from '@/components/forms/user-form';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { StatusToggleDialog } from '@/components/data-display/status-toggle-dialog';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: string;
  is_active: string;
  role_id: number | null;
  company_id: number;
  role?: {
    id: number;
    name: string;
  } | null;
  company?: {
    id: number;
    name: string;
  } | null;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['users', searchTerm, currentPage],
    queryFn: () => api.get('/users', { search: searchTerm, page: currentPage, limit: 10 }),
  });

  // Backend returns: { success: true, data: [...users...], pagination: {...} }
  const users: User[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete({ id: user.id, name: user.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatusClick = (user: User) => {
    setUserToToggle(user);
    setStatusToggleDialogOpen(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle) return;

    const newStatus = userToToggle.is_active === 'true' ? 'false' : 'true';
    const statusText = newStatus === 'true' ? 'activated' : 'deactivated';

    try {
      await api.put(`/users/${userToToggle.id}`, { is_active: newStatus });
      toast({
        title: 'Success',
        description: `User ${statusText} successfully`,
      });
      setStatusToggleDialogOpen(false);
      setUserToToggle(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${statusText} user`,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      sortKey: 'company.name', // Sort by company name
      render: (user) => (
        <div>
          <div className="font-medium">{user.company?.name || 'N/A'}</div>
          <Badge variant="outline" className="mt-1">
            ID: {user.company_id || user.company?.id || 'N/A'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortKey: 'role.name', // Sort by role name
      render: (user) => (
        <Badge variant={user.role ? 'default' : 'secondary'}>
          {user.role?.name || 'No role'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <Badge
          variant={user.is_active === 'true' ? 'default' : 'destructive'}
          className={
            user.is_active === 'true'
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        >
          {user.is_active === 'true' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false, // Actions column is not sortable
      render: (user) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit User',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(user),
          },
          {
            label: user.is_active === 'true' ? 'Deactivate User' : 'Activate User',
            icon: user.is_active === 'true' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
            onClick: () => handleToggleStatusClick(user),
          },
        ];

        // Only add delete action if user is active
        if (user.is_active === 'true') {
          actions.push({
            label: 'Delete User',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(user),
            variant: 'destructive',
          });
        }

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (user: User): React.ReactNode => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Company:</span>
          <span className="font-medium">{user.company?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Role:</span>
          <Badge variant={user.role ? 'default' : 'secondary'}>
            {user.role?.name || 'No role'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <Badge
            variant={user.is_active === 'true' ? 'default' : 'destructive'}
            className={
              user.is_active === 'true'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {user.is_active === 'true' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(user)}
          className="flex-1"
          title="Edit User"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatusClick(user)}
          className={`flex-1 ${
            user.is_active === 'true'
              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
          }`}
          title={user.is_active === 'true' ? 'Deactivate User' : 'Activate User'}
        >
          {user.is_active === 'true' ? (
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
        {/* Only show delete button for active users */}
        {user.is_active === 'true' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(user)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete User"
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage system users</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4">
          <DataView
            data={users}
            columns={columns}
            renderGridItem={renderGridItem}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No users found"
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
            defaultView="table"
            gridCols={3}
            showViewSwitcher={true}
            storageKey="users-view-mode"
          />
        </div>
      </div>

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        mode={formMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        itemName={userToDelete?.name}
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove this user and all associated data.`}
      />

      <StatusToggleDialog
        open={statusToggleDialogOpen}
        onOpenChange={setStatusToggleDialogOpen}
        onConfirm={handleToggleStatusConfirm}
        isActive={userToToggle?.is_active === 'true'}
        itemName={userToToggle?.name || ''}
      />
    </div>
  );
}
