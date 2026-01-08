'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin, Edit, Trash2, ChevronRight, ChevronDown, Upload } from 'lucide-react';
import { LocationForm } from '@/components/forms/location-form';
import { BulkUploadDialog } from '@/components/locations/bulk-upload-dialog';
import { useToast } from '@/components/ui/use-toast';
import { DataView } from '@/components/data-display/data-view';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';
import { ActionsMenu, ActionIcons } from '@/components/data-display/actions-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';

interface Location {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  parent_id: string | null;
  level: 'EMIRATE' | 'NEIGHBOURHOOD' | 'CLUSTER' | 'BUILDING' | 'BUILDING_LVL1' | 'BUILDING_LVL2';
  full_path: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  sort_order: number;
  parent?: {
    id: string;
    name: string;
    level: string;
  } | null;
  _count?: {
    children: number;
    buildings: number;
  };
}

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['locations', searchTerm, currentPage],
    queryFn: () => api.get('/locations', { search: searchTerm, page: currentPage, limit: 100 }),
  });

  // Backend returns: { success: true, data: [...locations...], pagination: {...} }
  const locations: Location[] = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleCreate = () => {
    setSelectedLocation(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (location: Location) => {
    setLocationToDelete({ id: location.id, name: location.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await api.delete(`/locations/${locationToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete location',
        variant: 'destructive',
      });
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const levelColors: Record<string, string> = {
    EMIRATE: 'bg-blue-100 text-blue-800',
    NEIGHBOURHOOD: 'bg-green-100 text-green-800',
    CLUSTER: 'bg-purple-100 text-purple-800',
    BUILDING: 'bg-orange-100 text-orange-800',
    BUILDING_LVL1: 'bg-pink-100 text-pink-800',
    BUILDING_LVL2: 'bg-yellow-100 text-yellow-800',
  };

  const columns: Column<Location>[] = [
    {
      key: 'name',
      header: 'Location Name',
      sortable: true,
      render: (location) => (
        <div className="flex items-center gap-1 sm:gap-2 min-w-[150px]">
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm truncate">{location.name}</div>
            {location.slug && (
              <div className="text-xs text-muted-foreground truncate">/{location.slug}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      render: (location) => (
        <Badge variant="outline" className={`text-xs ${levelColors[location.level] || 'bg-gray-100 text-gray-800'}`}>
          <span className="hidden sm:inline">{location.level.replace(/_/g, ' ')}</span>
          <span className="sm:hidden">{location.level.split('_')[0]}</span>
        </Badge>
      ),
    },
    {
      key: 'full_path',
      header: 'Full Path',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (location) => (
        <div className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-md truncate" title={location.full_path}>
          {location.full_path}
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      sortable: true,
      sortKey: 'parent.name',
      className: 'hidden lg:table-cell',
      render: (location) => (
        <div>
          {location.parent ? (
            <div>
              <span className="text-xs sm:text-sm">{location.parent.name}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {location.parent.level}
              </Badge>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-muted-foreground">Root</span>
          )}
        </div>
      ),
    },
    {
      key: 'coordinates',
      header: 'Coordinates',
      sortable: false,
      className: 'hidden xl:table-cell',
      render: (location) => (
        <div className="text-xs text-muted-foreground">
          {location.latitude && location.longitude ? (
            <>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </>
          ) : (
            'N/A'
          )}
        </div>
      ),
    },
    {
      key: 'children',
      header: 'Children',
      sortable: false,
      className: 'hidden sm:table-cell',
      render: (location) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="text-xs">
            {location._count?.children || 0} locations
          </Badge>
          <Badge variant="outline" className="text-xs">
            {location._count?.buildings || 0} buildings
          </Badge>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (location) => (
        <Badge
          variant={location.is_active ? 'default' : 'destructive'}
          className={
            location.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        >
          {location.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (location) => {
        const actions: Array<{
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          variant?: 'default' | 'destructive';
        }> = [
          {
            label: 'Edit Location',
            icon: ActionIcons.Edit,
            onClick: () => handleEdit(location),
          },
          {
            label: 'Delete Location',
            icon: ActionIcons.Delete,
            onClick: () => handleDeleteClick(location),
            variant: 'destructive',
          },
        ];

        return <ActionsMenu actions={actions} />;
      },
    },
  ];

  const renderGridItem = (location: Location) => (
    <Card key={location.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {location.name}
            </h3>
            {location.slug && (
              <p className="text-sm text-muted-foreground">/{location.slug}</p>
            )}
          </div>
          <Badge variant="outline" className={levelColors[location.level] || 'bg-gray-100 text-gray-800'}>
            {location.level.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-muted-foreground">
            <div className="truncate" title={location.full_path}>
              {location.full_path}
            </div>
          </div>

          {location.parent && (
            <div className="text-sm">
              <span className="text-muted-foreground">Parent: </span>
              <span className="font-medium">{location.parent.name}</span>
            </div>
          )}

          {location.latitude && location.longitude && (
            <div className="text-xs text-muted-foreground">
              📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              {location._count?.children || 0} children
            </Badge>
            <Badge variant="outline" className="text-xs">
              {location._count?.buildings || 0} buildings
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleEdit(location)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDeleteClick(location)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Container className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage location hierarchy (Emirate → Neighbourhood → Cluster → Building)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setBulkUploadOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Bulk Upload</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Location</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <DataView
          data={locations}
          columns={columns}
          renderGridItem={renderGridItem}
          isLoading={isLoading}
          error={error}
          emptyMessage="No locations found"
          pagination={
            pagination
              ? {
                  currentPage: pagination.page || currentPage,
                  totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 100)),
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
          defaultView="table"
          storageKey="locations-view-mode"
          gridCols={3}
        />
      </div>

      {/* Location Form Dialog */}
      <LocationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        location={selectedLocation || undefined}
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
        title="Delete Location"
        description={`Are you sure you want to delete "${locationToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={() => {
          refetch();
        }}
      />
    </Container>
  );
}

