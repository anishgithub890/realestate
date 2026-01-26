'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Tag,
  MessageSquare,
  Paperclip,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCardForm } from '@/components/forms/kanban-card-form';
import { KanbanColumnForm } from '@/components/forms/kanban-column-form';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanColumn {
  id: number;
  name: string;
  position: number;
  color?: string;
  is_done: boolean;
  wip_limit?: number;
  cards: KanbanCard[];
}

interface KanbanCard {
  id: number;
  title: string;
  description?: string;
  card_type: string;
  priority: string;
  due_date?: string;
  position: number;
  column_id?: number;
  assigned_to?: number;
  assignee?: {
    id: number;
    name: string;
  };
  _count?: {
    comments: number;
    attachments: number;
  };
}

export default function KanbanBoardViewPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = parseInt(params.id as string);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [columnFormMode, setColumnFormMode] = useState<'create' | 'edit'>('create');
  const [targetColumnId, setTargetColumnId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'card' | 'column'; name: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: boardData, isLoading } = useQuery<any>({
    queryKey: ['kanban-board', boardId],
    queryFn: () => api.get(`/kanban/boards/${boardId}`),
    enabled: !!boardId,
  });

  const board = boardData?.data;
  const columns: KanbanColumn[] = board?.columns || [];

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, columnId, position }: { cardId: number; columnId: number; position: number }) =>
      api.post(`/kanban/cards/${cardId}/move`, { column_id: columnId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to move card',
        variant: 'destructive',
      });
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: (columnIds: number[]) =>
      api.post(`/kanban/boards/${boardId}/columns/reorder`, { column_ids: columnIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reorder columns',
        variant: 'destructive',
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      const card = active.data.current.card as KanbanCard;
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    if (active.data.current?.type === 'card') {
      const card = active.data.current.card as KanbanCard;
      const overId = over.id as string;
      
      // Find the target column
      let targetColumn: KanbanColumn | undefined;
      
      // Check if dropped on a column (droppable)
      if (over.data.current?.type === 'column') {
        targetColumn = over.data.current.column as KanbanColumn;
      }
      // If dropped on a card, find its column
      else if (over.data.current?.type === 'card') {
        const overCard = over.data.current.card as KanbanCard;
        targetColumn = columns.find(col => col.cards.find(c => c.id === overCard.id));
      }
      // Fallback: try to find by ID
      else {
        const overColumnId = parseInt(overId);
        targetColumn = columns.find(col => col.id === overColumnId);
      }

      if (targetColumn) {
        const currentColumn = columns.find(col => col.cards.find(c => c.id === card.id));
        const isSameColumn = currentColumn?.id === targetColumn.id;
        
        if (!isSameColumn) {
          const newPosition = targetColumn.cards.length;
          moveCardMutation.mutate({
            cardId: card.id,
            columnId: targetColumn.id,
            position: newPosition,
          });
        }
      }
    }
  };

  const handleCreateCard = (columnId: number) => {
    setTargetColumnId(columnId);
    setSelectedCard(null);
    setCardFormMode('create');
    setIsCardFormOpen(true);
  };

  const handleEditCard = (card: KanbanCard) => {
    setSelectedCard(card);
    setCardFormMode('edit');
    setIsCardFormOpen(true);
  };

  const handleDeleteCard = (card: KanbanCard) => {
    setItemToDelete({ id: card.id, type: 'card', name: card.title });
    setDeleteDialogOpen(true);
  };

  const handleCreateColumn = () => {
    setSelectedColumn(null);
    setColumnFormMode('create');
    setIsColumnFormOpen(true);
  };

  const handleEditColumn = (column: KanbanColumn) => {
    setSelectedColumn(column);
    setColumnFormMode('edit');
    setIsColumnFormOpen(true);
  };

  const handleDeleteColumn = (column: KanbanColumn) => {
    setItemToDelete({ id: column.id, type: 'column', name: column.name });
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'card' | 'column' }) => {
      if (type === 'card') {
        return api.delete(`/kanban/cards/${id}`);
      } else {
        return api.delete(`/kanban/columns/${id}`);
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `${variables.type === 'card' ? 'Card' : 'Column'} deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate({ id: itemToDelete.id, type: itemToDelete.type });
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return (
      <Container className="py-2 sm:py-4 md:py-6">
        <div className="text-center py-12">Loading board...</div>
      </Container>
    );
  }

  if (!board) {
    return (
      <Container className="py-2 sm:py-4 md:py-6">
        <div className="text-center py-12 text-gray-500">Board not found</div>
      </Container>
    );
  }

  return (
    <Container className="py-2 sm:py-4 md:py-6 space-y-2 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/kanban')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{board.name}</h1>
            {board.description && (
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base truncate">{board.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleCreateColumn}
            size="sm"
            variant="outline"
            className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Column</span>
            <span className="sm:hidden">Column</span>
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {columns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              onAddCard={() => handleCreateCard(column.id)}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onEditColumn={() => handleEditColumn(column)}
              onDeleteColumn={() => handleDeleteColumn(column)}
              priorityColors={priorityColors}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <Card className="w-64 p-3 shadow-lg opacity-90">
              <CardContent className="p-0">
                <div className="font-medium text-sm">{activeCard.title}</div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {columns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No columns yet. Create your first column to get started!
        </div>
      )}

      <KanbanCardForm
        open={isCardFormOpen}
        onOpenChange={setIsCardFormOpen}
        card={selectedCard || undefined}
        mode={cardFormMode}
        boardId={boardId}
        defaultColumnId={targetColumnId || undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
          setIsCardFormOpen(false);
          setTargetColumnId(null);
        }}
      />

      <KanbanColumnForm
        open={isColumnFormOpen}
        onOpenChange={setIsColumnFormOpen}
        column={selectedColumn || undefined}
        mode={columnFormMode}
        boardId={boardId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
          setIsColumnFormOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${itemToDelete?.type === 'card' ? 'Card' : 'Column'}`}
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
}

function KanbanColumnComponent({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
  priorityColors,
}: {
  column: KanbanColumn;
  onAddCard: () => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (card: KanbanCard) => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  priorityColors: Record<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id.toString(),
    data: { type: 'column', column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-64 sm:w-72 bg-gray-50 rounded-lg p-2 sm:p-3 ${isOver ? 'bg-blue-50 border-2 border-blue-300' : ''}`}
      style={{ minWidth: '256px' }}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base truncate">{column.name}</h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            {column.cards.length}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditColumn}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Column
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteColumn} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SortableContext 
        items={column.cards.map(c => c.id.toString())} 
        strategy={verticalListSortingStrategy}
        id={column.id.toString()}
      >
        <div className="space-y-2 min-h-[100px]">
          {column.cards.map((card) => (
            <KanbanCardComponent
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              priorityColors={priorityColors}
            />
          ))}
        </div>
      </SortableContext>

      <Button
        variant="ghost"
        size="sm"
        onClick={onAddCard}
        className="w-full mt-2 text-xs sm:text-sm"
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        Add Card
      </Button>
    </div>
  );
}

function KanbanCardComponent({
  card,
  onEdit,
  onDelete,
  priorityColors,
}: {
  card: KanbanCard;
  onEdit: (card: KanbanCard) => void;
  onDelete: (card: KanbanCard) => void;
  priorityColors: Record<string, string>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id.toString(), data: { type: 'card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow relative"
      onClick={() => onEdit(card)}
    >
      <CardContent className="p-2 sm:p-3 relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-xs sm:text-sm flex-1 min-w-0">{card.title}</h4>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        {card.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-xs ${priorityColors[card.priority] || 'bg-gray-100 text-gray-800'}`}
          >
            {card.priority}
          </Badge>

          {card.assignee && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{card.assignee.name}</span>
            </div>
          )}

          {card.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{new Date(card.due_date).toLocaleDateString()}</span>
            </div>
          )}

          {card._count && (
            <>
              {card._count.comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MessageSquare className="w-3 h-3" />
                  <span>{card._count.comments}</span>
                </div>
              )}
              {card._count.attachments > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Paperclip className="w-3 h-3" />
                  <span>{card._count.attachments}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(card); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(card); }}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
