'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Layout, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';

interface KanbanBoard {
  id: number;
  name: string;
  description: string | null;
  board_type: string;
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  _count?: {
    cards: number;
    columns: number;
  };
}

export default function KanbanPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ['kanban-boards', searchTerm],
    queryFn: () => api.get('/kanban/boards', { search: searchTerm, page: 1, limit: 50 }),
  });

  const boards: KanbanBoard[] = data?.data || [];

  const handleDeleteClick = (board: KanbanBoard) => {
    setBoardToDelete({ id: board.id, name: board.name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return;

    try {
      await api.delete(`/kanban/boards/${boardToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Board deleted successfully',
      });
      setDeleteDialogOpen(false);
      setBoardToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete board',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (board: KanbanBoard) => {
    try {
      await api.post(`/kanban/boards/templates/${board.id}/duplicate`);
      toast({
        title: 'Success',
        description: 'Board duplicated successfully',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to duplicate board',
        variant: 'destructive',
      });
    }
  };

  const boardTypeColors: Record<string, string> = {
    leads: 'bg-blue-100 text-blue-800',
    properties: 'bg-green-100 text-green-800',
    deals: 'bg-purple-100 text-purple-800',
    contracts: 'bg-orange-100 text-orange-800',
    maintenance: 'bg-red-100 text-red-800',
    custom: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban Boards</h1>
          <p className="text-gray-600 mt-2">Manage your workflow with visual boards</p>
        </div>
        <Button onClick={() => router.push('/kanban/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Board
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading boards...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No boards found. Create your first board to get started!
            </div>
          ) : (
            boards.map((board) => (
              <Card
                key={board.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/kanban/${board.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Layout className="w-5 h-5" />
                        {board.name}
                      </CardTitle>
                      {board.description && (
                        <CardDescription className="mt-2">{board.description}</CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="hover:bg-gray-100 rounded p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/kanban/${board.id}/edit`);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {board.is_template && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(board);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(board);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={boardTypeColors[board.board_type] || 'bg-gray-100 text-gray-800'}
                      >
                        {board.board_type}
                      </Badge>
                      {board.is_template && (
                        <Badge variant="secondary">Template</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {board._count?.cards || 0} cards
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Board"
        description={`Are you sure you want to delete "${boardToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

