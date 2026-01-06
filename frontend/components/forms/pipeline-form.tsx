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
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const pipelineSchema = z.object({
  name: z.string().min(1, 'Pipeline name is required'),
  stages: z.string().min(1, 'Stages are required'),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

interface PipelineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function PipelineForm({
  open,
  onOpenChange,
  pipeline,
  mode,
  onSuccess,
}: PipelineFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stages, setStages] = useState<Array<{ name: string; order: number }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      is_active: true,
      is_default: false,
    },
  });

  useEffect(() => {
    if (pipeline && open && mode === 'edit') {
      const pipelineStages =
        typeof pipeline.stages === 'string'
          ? JSON.parse(pipeline.stages)
          : pipeline.stages;
      setStages(Array.isArray(pipelineStages) ? pipelineStages : []);
      setValue('name', pipeline.name || '');
      setValue('is_active', pipeline.is_active !== undefined ? pipeline.is_active : true);
      setValue('is_default', pipeline.is_default || false);
      setValue('stages', JSON.stringify(pipelineStages, null, 2));
    } else if (open && mode === 'create') {
      const defaultStages = [
        { name: 'New', order: 1 },
        { name: 'Contacted', order: 2 },
        { name: 'Qualified', order: 3 },
        { name: 'Proposal', order: 4 },
        { name: 'Negotiation', order: 5 },
        { name: 'Won', order: 6 },
        { name: 'Lost', order: 7 },
      ];
      setStages(defaultStages);
      setValue('stages', JSON.stringify(defaultStages, null, 2));
      reset({
        is_active: true,
        is_default: false,
      });
    }
  }, [pipeline, open, mode, setValue, reset]);

  const addStage = () => {
    const newStage = {
      name: `Stage ${stages.length + 1}`,
      order: stages.length + 1,
    };
    const updatedStages = [...stages, newStage];
    setStages(updatedStages);
    setValue('stages', JSON.stringify(updatedStages, null, 2));
  };

  const removeStage = (index: number) => {
    const updatedStages = stages.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setStages(updatedStages);
    setValue('stages', JSON.stringify(updatedStages, null, 2));
  };

  const updateStage = (index: number, field: 'name' | 'order', value: string | number) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setStages(updatedStages);
    setValue('stages', JSON.stringify(updatedStages, null, 2));
  };

  const mutation = useMutation({
    mutationFn: (data: PipelineFormData) => {
      const payload: any = {
        name: data.name,
        stages: data.stages,
        is_default: data.is_default,
        is_active: data.is_active,
      };

      if (mode === 'create') {
        return api.post('/routing/pipelines', payload);
      } else {
        return api.put(`/routing/pipelines/${pipeline.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Pipeline created successfully' : 'Pipeline updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      reset();
      setStages([]);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} pipeline`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: PipelineFormData) => {
    // Validate JSON
    try {
      const parsed = JSON.parse(data.stages);
      if (!Array.isArray(parsed)) {
        toast({
          title: 'Error',
          description: 'Stages must be an array',
          variant: 'destructive',
        });
        return;
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Invalid JSON in stages field',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Pipeline' : 'Edit Pipeline'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new sales pipeline with stages'
              : 'Update pipeline information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Pipeline Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Pipeline Stages *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStage}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            </div>
            <div className="space-y-2 border rounded-lg p-4">
              {stages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No stages added. Click "Add Stage" to add stages.
                </p>
              ) : (
                stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Input
                      type="number"
                      value={stage.order}
                      onChange={(e) => updateStage(index, 'order', parseInt(e.target.value) || 1)}
                      className="w-20"
                      min="1"
                    />
                    <Input
                      value={stage.name}
                      onChange={(e) => updateStage(index, 'name', e.target.value)}
                      placeholder="Stage name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStage(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Textarea
              {...register('stages')}
              rows={8}
              className="mt-2 font-mono text-sm hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stages are automatically saved as JSON. Each stage should have a name and order.
            </p>
            {errors.stages && (
              <p className="text-sm text-red-500 mt-1">{errors.stages.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={watch('is_default')}
                onChange={(e) => setValue('is_default', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_default">Default Pipeline</Label>
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
              {mode === 'create' ? 'Create Pipeline' : 'Update Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

