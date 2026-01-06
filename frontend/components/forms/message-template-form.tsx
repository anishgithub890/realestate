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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const messageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.string().min(1, 'Template type is required'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Body is required'),
  variables: z.string().optional(),
  is_active: z.boolean().default(true),
});

type MessageTemplateFormData = z.infer<typeof messageTemplateSchema>;

interface MessageTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function MessageTemplateForm({
  open,
  onOpenChange,
  template,
  mode,
  onSuccess,
}: MessageTemplateFormProps) {
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
  } = useForm<MessageTemplateFormData>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const templateType = watch('type');

  useEffect(() => {
    if (template && open && mode === 'edit') {
      const variables =
        typeof template.variables === 'string'
          ? template.variables
          : JSON.stringify(template.variables || {}, null, 2);
      setValue('name', template.name || '');
      setValue('type', template.type || '');
      setValue('subject', template.subject || '');
      setValue('body', template.body || '');
      setValue('variables', variables);
      setValue('is_active', template.is_active !== undefined ? template.is_active : true);
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
        variables: JSON.stringify({}, null, 2),
      });
    }
  }, [template, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: MessageTemplateFormData) => {
      const payload: any = {
        name: data.name,
        type: data.type,
        subject: data.subject || null,
        body: data.body,
        variables: data.variables ? JSON.parse(data.variables) : {},
        is_active: data.is_active,
      };

      if (mode === 'create') {
        return api.post('/automation/templates', payload);
      } else {
        return api.put(`/automation/templates/${template.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create'
            ? 'Message template created successfully'
            : 'Message template updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} message template`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: MessageTemplateFormData) => {
    // Validate JSON if variables provided
    if (data.variables) {
      try {
        JSON.parse(data.variables);
      } catch (e) {
        toast({
          title: 'Error',
          description: 'Invalid JSON in variables field',
          variant: 'destructive',
        });
        return;
      }
    }
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Message Template' : 'Edit Message Template'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new email or SMS template for automated communications'
              : 'Update message template information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
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
              <Label htmlFor="type">Template Type *</Label>
              <Select
                value={watch('type') || ''}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>

          {templateType === 'email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Email subject line"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use variables like {'{name}'}, {'{email}'}, etc.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="body">Message Body *</Label>
            <Textarea
              id="body"
              {...register('body')}
              rows={10}
              className={errors.body ? 'border-red-500' : ''}
              placeholder="Enter your message template. Use variables like {name}, {email}, {property_type}, etc."
            />
            {errors.body && (
              <p className="text-sm text-red-500 mt-1">{errors.body.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: {'{name}'}, {'{email}'}, {'{mobile_no}'}, {'{property_type}'},
              {'{interest_type}'}, {'{min_price}'}, {'{max_price}'}
            </p>
          </div>

          <div>
            <Label htmlFor="variables">Variables (JSON) - Optional</Label>
            <Textarea
              id="variables"
              {...register('variables')}
              rows={4}
              className="font-mono text-sm"
              placeholder='{"custom_field": "value"}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional JSON object for custom variables
            </p>
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
              {mode === 'create' ? 'Create Template' : 'Update Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

