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

const boardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  description: z.string().optional(),
  board_type: z.string().min(1, 'Board type is required'),
  is_template: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface KanbanBoardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const BOARD_TYPES = [
  { value: 'leads', label: 'Leads' },
  { value: 'properties', label: 'Properties' },
  { value: 'deals', label: 'Deals' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'custom', label: 'Custom' },
];

export function KanbanBoardForm({
  open,
  onOpenChange,
  board,
  mode,
  onSuccess,
}: KanbanBoardFormProps) {
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
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      board_type: 'custom',
      is_template: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (board && open && mode === 'edit') {
      setValue('name', board.name || '');
      setValue('description', board.description || '');
      setValue('board_type', board.board_type || '');
      setValue('is_template', board.is_template || false);
      setValue('is_active', board.is_active !== undefined ? board.is_active : true);
    } else if (open && mode === 'create') {
      reset({
        name: '',
        description: '',
        board_type: 'custom',
        is_template: false,
        is_active: true,
      });
    }
  }, [board, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async (data: BoardFormData) => {
      const payload: any = {
        name: data.name,
        description: data.description || null,
        board_type: data.board_type,
        is_template: data.is_template,
        is_active: data.is_active,
      };

      console.log('Sending API request with payload:', payload);
      
      try {
        const response: any = mode === 'create'
          ? await api.post('/kanban/boards', payload)
          : await api.put(`/kanban/boards/${board.id}`, payload);
        
        console.log('API response received:', response);
        
        // Check if response indicates success
        if (response && response.success === false) {
          throw new Error(response.error || 'Request failed');
        }
        
        return response;
      } catch (error: any) {
        console.error('API request error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Mutation success, response:', response);
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Board created successfully' : 'Board updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['kanban-boards'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Kanban board mutation error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || `Failed to ${mode} board`;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: BoardFormData) => {
    console.log('Form submitted with data:', data);
    if (!data.board_type) {
      toast({
        title: 'Error',
        description: 'Please select a board type',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Board' : 'Edit Board'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new kanban board to organize your workflow'
              : 'Update board information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('board_type')} />
          <div>
            <Label htmlFor="name">Board Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter board name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter board description (optional)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="board_type">Board Type *</Label>
            <Select
              value={watch('board_type') || 'custom'}
              onValueChange={(value) => {
                setValue('board_type', value, { shouldValidate: true });
              }}
            >
              <SelectTrigger className={errors.board_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select board type" />
              </SelectTrigger>
              <SelectContent>
                {BOARD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.board_type && (
              <p className="text-sm text-red-500 mt-1">{errors.board_type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_template"
                checked={watch('is_template')}
                onChange={(e) => setValue('is_template', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_template">Template Board</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
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
              {mode === 'create' ? 'Create Board' : 'Update Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
