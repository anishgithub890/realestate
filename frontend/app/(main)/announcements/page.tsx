'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Bell, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { AnnouncementForm } from '@/components/forms/announcement-form';
import { format } from 'date-fns';

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string | null;
  target_scope: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<{ id: number; title: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['announcements', searchTerm, currentPage],
    queryFn: () => api.get('/announcements', { search: searchTerm, page: currentPage, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Announcement deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete announcement',
        variant: 'destructive',
      });
    },
  });

  const announcements: Announcement[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setAnnouncementToDelete({ id: announcement.id, title: announcement.title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete.id);
    }
  };

  const isActive = (announcement: Announcement) => {
    if (!announcement.is_active) return false;
    const now = new Date();
    if (announcement.start_date && new Date(announcement.start_date) > now) return false;
    if (announcement.end_date && new Date(announcement.end_date) < now) return false;
    return true;
  };

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (announcement) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{announcement.title}</div>
            {announcement.type && (
              <div className="text-xs text-muted-foreground">{announcement.type}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      sortable: false,
      render: (announcement) => (
        <div className="text-sm text-muted-foreground max-w-md truncate">
          {announcement.message}
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Active Period',
      sortable: true,
      sortKey: 'start_date',
      render: (announcement) => (
        <div className="text-sm">
          {announcement.start_date ? (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {format(new Date(announcement.start_date), 'MMM dd, yyyy')}
            </div>
          ) : (
            <span className="text-muted-foreground">No start date</span>
          )}
          {announcement.end_date && (
            <div className="text-xs text-muted-foreground">
              to {format(new Date(announcement.end_date), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (announcement) => (
        <Badge
          variant={isActive(announcement) ? 'default' : 'secondary'}
          className={
            isActive(announcement)
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {isActive(announcement) ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'creator',
      header: 'Created By',
      sortable: true,
      sortKey: 'creator.name',
      render: (announcement) => (
        <div className="flex items-center gap-1 text-sm">
          <User className="w-3 h-3 text-muted-foreground" />
          {announcement.creator?.name || 'N/A'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (announcement) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Announcement',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(announcement),
          },
          {
            label: 'Delete Announcement',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(announcement),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (announcement: Announcement) => (
    <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              {announcement.title}
            </h3>
            {announcement.type && (
              <Badge variant="outline" className="mt-1">
                {announcement.type}
              </Badge>
            )}
          </div>
          <Badge
            variant={isActive(announcement) ? 'default' : 'secondary'}
            className={
              isActive(announcement)
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }
          >
            {isActive(announcement) ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {announcement.message}
          </p>

          {announcement.start_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(announcement.start_date), 'MMM dd, yyyy')}
              {announcement.end_date && (
                <> - {format(new Date(announcement.end_date), 'MMM dd, yyyy')}</>
              )}
            </div>
          )}

          {announcement.creator && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {announcement.creator.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(announcement)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(announcement)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">Manage system announcements and notifications</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataView
        data={announcements}
        columns={columns}
        renderGridItem={renderGridItem}
        isLoading={isLoading}
        error={error}
        emptyMessage="No announcements found"
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
        storageKey="announcements-view-mode"
        gridCols={3}
      />

      {/* Announcement Form Dialog */}
      <AnnouncementForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        announcement={selectedAnnouncement || undefined}
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
        title="Delete Announcement"
        description={`Are you sure you want to delete "${announcementToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

