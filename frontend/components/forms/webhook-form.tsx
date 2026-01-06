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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const webhookSchema = z.object({
  event_type: z.string().min(1, 'Event type is required'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  secret: z.string().optional(),
  is_active: z.boolean().default(true),
  integration_id: z.string().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface WebhookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function WebhookForm({
  open,
  onOpenChange,
  webhook,
  mode,
  onSuccess,
}: WebhookFormProps) {
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
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // Fetch dependencies
  const { data: integrations } = useQuery<any>({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations', { limit: 1000 }),
    enabled: open,
  });

  useEffect(() => {
    if (webhook && open && mode === 'edit') {
      setValue('event_type', webhook.event_type || '');
      setValue('url', webhook.url || '');
      setValue('secret', webhook.secret || '');
      setValue('is_active', webhook.is_active !== undefined ? webhook.is_active : true);
      setValue('integration_id', webhook.integration_id?.toString() || 'none');
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
      });
    }
  }, [webhook, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: WebhookFormData) => {
      const payload: any = {
        event_type: data.event_type,
        url: data.url,
        secret: data.secret || null,
        is_active: data.is_active,
        integration_id:
          data.integration_id && data.integration_id !== 'none'
            ? parseInt(data.integration_id)
            : null,
      };

      if (mode === 'create') {
        return api.post('/integrations/webhooks', payload);
      } else {
        return api.put(`/integrations/webhooks/${webhook.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Webhook created successfully' : 'Webhook updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} webhook`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: WebhookFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const integrationsList = integrations?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Webhook' : 'Edit Webhook'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new webhook to receive real-time events'
              : 'Update webhook information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={watch('event_type') || ''}
              onValueChange={(value) => setValue('event_type', value)}
            >
              <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead.created">Lead Created</SelectItem>
                <SelectItem value="lead.updated">Lead Updated</SelectItem>
                <SelectItem value="lead.assigned">Lead Assigned</SelectItem>
                <SelectItem value="contract.created">Contract Created</SelectItem>
                <SelectItem value="contract.updated">Contract Updated</SelectItem>
                <SelectItem value="payment.received">Payment Received</SelectItem>
                <SelectItem value="ticket.created">Ticket Created</SelectItem>
                <SelectItem value="ticket.updated">Ticket Updated</SelectItem>
              </SelectContent>
            </Select>
            {errors.event_type && (
              <p className="text-sm text-red-500 mt-1">{errors.event_type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">Webhook URL *</Label>
            <Input
              id="url"
              type="url"
              {...register('url')}
              placeholder="https://example.com/webhook"
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="secret">Secret Key (Optional)</Label>
            <Input
              id="secret"
              type="password"
              {...register('secret')}
              placeholder="Secret key for webhook signature verification"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional secret key for verifying webhook authenticity
            </p>
          </div>

          <div>
            <Label htmlFor="integration_id">Integration (Optional)</Label>
            <Select
              value={watch('integration_id') || 'none'}
              onValueChange={(value) => setValue('integration_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select integration (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {integrationsList.map((integration: any) => (
                  <SelectItem key={integration.id} value={integration.id.toString()}>
                    {integration.integration_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {mode === 'create' ? 'Create Webhook' : 'Update Webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

