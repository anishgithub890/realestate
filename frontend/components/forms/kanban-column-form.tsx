'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const columnSchema = z.object({
  name: z.string().min(1, 'Column name is required'),
  color: z.string().optional(),
  is_done: z.boolean().default(false),
  wip_limit: z.string().optional(),
});

type ColumnFormData = z.infer<typeof columnSchema>;

interface KanbanColumnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: any;
  mode: 'create' | 'edit';
  boardId: number;
  onSuccess?: () => void;
}

const COLUMN_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6B7280', label: 'Gray' },
];

export function KanbanColumnForm({
  open,
  onOpenChange,
  column,
  mode,
  boardId,
  onSuccess,
}: KanbanColumnFormProps) {
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
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      is_done: false,
    },
  });

  useEffect(() => {
    if (column && open && mode === 'edit') {
      setValue('name', column.name || '');
      setValue('color', column.color || '');
      setValue('is_done', column.is_done || false);
      setValue('wip_limit', column.wip_limit?.toString() || '');
    } else if (open && mode === 'create') {
      reset({
        name: '',
        color: '#3B82F6',
        is_done: false,
        wip_limit: '',
      });
    }
  }, [column, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: ColumnFormData) => {
      const payload: any = {
        name: data.name,
        color: data.color || null,
        is_done: data.is_done,
        wip_limit: data.wip_limit ? parseInt(data.wip_limit) : null,
      };

      if (mode === 'create') {
        return api.post(`/kanban/boards/${boardId}/columns`, payload);
      } else {
        return api.put(`/kanban/columns/${column.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Column created successfully' : 'Column updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} column`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ColumnFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Column' : 'Edit Column'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new column on the kanban board'
              : 'Update column information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Column Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter column name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    watch('color') === color.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <Input
              id="color"
              type="text"
              {...register('color')}
              placeholder="#3B82F6"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="wip_limit">WIP Limit (Optional)</Label>
            <Input
              id="wip_limit"
              type="number"
              {...register('wip_limit')}
              placeholder="Enter WIP limit"
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of cards allowed in this column
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_done"
              checked={watch('is_done')}
              onChange={(e) => setValue('is_done', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_done">Done Column</Label>
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
              {mode === 'create' ? 'Create Column' : 'Update Column'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
