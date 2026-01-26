'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const cardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  card_type: z.string().min(1, 'Card type is required'),
  column_id: z.number().min(1, 'Column is required'),
  priority: z.string().default('medium'),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  entity_id: z.string().optional(),
  entity_type: z.string().optional(),
});

type CardFormData = z.infer<typeof cardSchema>;

interface KanbanCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: any;
  mode: 'create' | 'edit';
  boardId: number;
  defaultColumnId?: number;
  onSuccess?: () => void;
}

const CARD_TYPES = [
  { value: 'lead', label: 'Lead' },
  { value: 'property', label: 'Property' },
  { value: 'deal', label: 'Deal' },
  { value: 'contract', label: 'Contract' },
  { value: 'task', label: 'Task' },
  { value: 'custom', label: 'Custom' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function KanbanCardForm({
  open,
  onOpenChange,
  card,
  mode,
  boardId,
  defaultColumnId,
  onSuccess,
}: KanbanCardFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  // Fetch board columns
  const { data: boardData } = useQuery<any>({
    queryKey: ['kanban-board', boardId],
    queryFn: () => api.get(`/kanban/boards/${boardId}`),
    enabled: open && !!boardId,
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery<any>({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { limit: 100 }),
    enabled: open,
  });

  const columns = boardData?.data?.columns || [];
  const users = usersData?.data || [];

  useEffect(() => {
    if (card && open && mode === 'edit') {
      setValue('title', card.title || '');
      setValue('description', card.description || '');
      setValue('card_type', card.card_type || '');
      setValue('column_id', card.column_id || card.column?.id || 0);
      setValue('priority', card.priority || 'medium');
      setValue('due_date', card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '');
      setValue('assigned_to', card.assigned_to?.toString() || 'none');
      setValue('entity_id', card.entity_id?.toString() || '');
      setValue('entity_type', card.entity_type || '');
    } else if (open && mode === 'create') {
      reset({
        title: '',
        description: '',
        card_type: 'task',
        column_id: defaultColumnId || (columns.length > 0 ? columns[0].id : 0),
        priority: 'medium',
        due_date: '',
        assigned_to: 'none',
        entity_id: '',
        entity_type: '',
      });
    }
  }, [card, open, mode, setValue, reset, defaultColumnId, columns]);

  const mutation = useMutation({
    mutationFn: (data: CardFormData) => {
      const payload: any = {
        title: data.title,
        description: data.description || null,
        card_type: data.card_type,
        column_id: data.column_id,
        priority: data.priority,
        assigned_to: data.assigned_to && data.assigned_to !== 'none' ? parseInt(data.assigned_to) : null,
        entity_id: data.entity_id ? parseInt(data.entity_id) : null,
        entity_type: data.entity_type || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      };

      if (mode === 'create') {
        return api.post(`/kanban/boards/${boardId}/cards`, payload);
      } else {
        return api.put(`/kanban/cards/${card.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Card created successfully' : 'Card updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} card`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: CardFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Card' : 'Edit Card'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new card on the kanban board'
              : 'Update card information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter card title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter card description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card_type">Card Type *</Label>
              <Select
                value={watch('card_type') || ''}
                onValueChange={(value) => setValue('card_type', value)}
              >
                <SelectTrigger className={errors.card_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.card_type && (
                <p className="text-sm text-red-500 mt-1">{errors.card_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="column_id">Column *</Label>
              <Select
                value={watch('column_id')?.toString() || ''}
                onValueChange={(value) => setValue('column_id', parseInt(value))}
              >
                <SelectTrigger className={errors.column_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col: any) => (
                    <SelectItem key={col.id} value={col.id.toString()}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.column_id && (
                <p className="text-sm text-red-500 mt-1">{errors.column_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority') || 'medium'}
                onValueChange={(value) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              value={watch('assigned_to') || 'none'}
              onValueChange={(value) => setValue('assigned_to', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Card' : 'Update Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
