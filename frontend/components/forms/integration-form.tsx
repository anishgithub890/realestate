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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const integrationSchema = z.object({
  integration_type: z.string().min(1, 'Integration type is required'),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  config: z.string().optional(),
  is_active: z.boolean().default(true),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface IntegrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const INTEGRATION_TYPES = [
  { value: 'google_ads', label: 'Google Ads', description: 'Sync leads from Google Ads campaigns' },
  { value: 'facebook_ads', label: 'Facebook Ads', description: 'Sync leads from Facebook Ads' },
  { value: 'zapier', label: 'Zapier', description: 'Connect with Zapier automation platform' },
  { value: 'bayut', label: 'Bayut', description: 'Sync properties and leads from Bayut portal' },
  { value: 'property_finder', label: 'Property Finder', description: 'Sync properties and leads from Property Finder' },
  { value: 'whatsapp_business', label: 'WhatsApp Business', description: 'Connect with WhatsApp Business API' },
];

export function IntegrationForm({
  open,
  onOpenChange,
  integration,
  mode,
  onSuccess,
}: IntegrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    if (integration && open) {
      if (mode === 'edit') {
        setValue('integration_type', integration.integration_type || '');
        setValue('api_key', integration.api_key && integration.api_key !== '***' ? integration.api_key : '');
        setValue('api_secret', integration.api_secret && integration.api_secret !== '***' ? integration.api_secret : '');
        setValue('access_token', integration.access_token && integration.access_token !== '***' ? integration.access_token : '');
        setValue('refresh_token', integration.refresh_token && integration.refresh_token !== '***' ? integration.refresh_token : '');
        setValue('config', integration.config ? JSON.stringify(integration.config, null, 2) : '');
        setValue('is_active', integration.is_active !== undefined ? integration.is_active : true);
        setSelectedType(integration.integration_type || '');
      } else if (mode === 'create' && integration.integration_type) {
        // Pre-fill integration type when creating from card click
        setValue('integration_type', integration.integration_type);
        setSelectedType(integration.integration_type);
        reset({
          integration_type: integration.integration_type,
          is_active: true,
        });
      }
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
      });
      setSelectedType('');
    }
  }, [integration, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: IntegrationFormData) => {
      const payload: any = {
        integration_type: data.integration_type,
        is_active: data.is_active,
      };

      // Only include fields if they have values
      if (data.api_key) payload.api_key = data.api_key;
      if (data.api_secret) payload.api_secret = data.api_secret;
      if (data.access_token) payload.access_token = data.access_token;
      if (data.refresh_token) payload.refresh_token = data.refresh_token;
      
      // Parse config JSON if provided
      if (data.config) {
        try {
          payload.config = JSON.parse(data.config);
        } catch (error) {
          throw new Error('Invalid JSON in config field');
        }
      }

      return api.post('/integrations', payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Integration created successfully' : 'Integration updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || `Failed to ${mode} integration`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: IntegrationFormData) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const selectedIntegrationInfo = INTEGRATION_TYPES.find(t => t.value === selectedType || watch('integration_type'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Connect Integration' : 'Edit Integration'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Connect a new integration to sync data and automate workflows'
              : 'Update integration settings'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="integration_type">Integration Type *</Label>
            <Select
              value={watch('integration_type') || ''}
              onValueChange={(value) => {
                setValue('integration_type', value);
                setSelectedType(value);
              }}
              disabled={mode === 'edit'}
            >
              <SelectTrigger className={errors.integration_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                {INTEGRATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.integration_type && (
              <p className="text-sm text-red-500 mt-1">{errors.integration_type.message}</p>
            )}
            {selectedIntegrationInfo && (
              <p className="text-xs text-muted-foreground mt-1">{selectedIntegrationInfo.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                {...register('api_key')}
                placeholder="Enter API key"
              />
            </div>

            <div>
              <Label htmlFor="api_secret">API Secret</Label>
              <Input
                id="api_secret"
                type="password"
                {...register('api_secret')}
                placeholder="Enter API secret"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="access_token">Access Token</Label>
              <Input
                id="access_token"
                type="password"
                {...register('access_token')}
                placeholder="Enter access token"
              />
            </div>

            <div>
              <Label htmlFor="refresh_token">Refresh Token</Label>
              <Input
                id="refresh_token"
                type="password"
                {...register('refresh_token')}
                placeholder="Enter refresh token"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="config">Configuration (JSON)</Label>
            <Textarea
              id="config"
              {...register('config')}
              placeholder='{"key": "value"}'
              className="font-mono text-xs"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional JSON configuration for the integration
            </p>
            {errors.config && (
              <p className="text-sm text-red-500 mt-1">{errors.config.message}</p>
            )}
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
              {mode === 'create' ? 'Connect Integration' : 'Update Integration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
