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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const automationRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_conditions: z.string().min(1, 'Trigger conditions are required'),
  action_type: z.string().min(1, 'Action type is required'),
  template_id: z.string().optional(),
  schedule_delay: z.string().optional(),
  schedule_unit: z.string().optional(),
  is_active: z.boolean().default(true),
});

type AutomationRuleFormData = z.infer<typeof automationRuleSchema>;

interface AutomationRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function AutomationRuleForm({
  open,
  onOpenChange,
  rule,
  mode,
  onSuccess,
}: AutomationRuleFormProps) {
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
  } = useForm<AutomationRuleFormData>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // Fetch dependencies
  const { data: templates } = useQuery<any>({
    queryKey: ['message-templates'],
    queryFn: () => api.get('/automation/templates', { limit: 1000 }),
    enabled: open,
  });

  const actionType = watch('action_type');

  useEffect(() => {
    if (rule && open && mode === 'edit') {
      const triggerConditions =
        typeof rule.trigger_conditions === 'string'
          ? rule.trigger_conditions
          : JSON.stringify(rule.trigger_conditions);
      setValue('name', rule.name || '');
      setValue('trigger_type', rule.trigger_type || '');
      setValue('trigger_conditions', triggerConditions);
      setValue('action_type', rule.action_type || '');
      setValue('template_id', rule.template_id?.toString() || 'none');
      setValue('schedule_delay', rule.schedule_delay?.toString() || '');
      setValue('schedule_unit', rule.schedule_unit || '');
      setValue('is_active', rule.is_active !== undefined ? rule.is_active : true);
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
        trigger_conditions: JSON.stringify(
          {
            activity_source_id: null,
            status_id: null,
            property_type: null,
            assigned_to: null,
          },
          null,
          2
        ),
      });
    }
  }, [rule, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: AutomationRuleFormData) => {
      const payload: any = {
        name: data.name,
        trigger_type: data.trigger_type,
        trigger_conditions: data.trigger_conditions,
        action_type: data.action_type,
        template_id:
          data.template_id && data.template_id !== 'none' ? parseInt(data.template_id) : null,
        schedule_delay: data.schedule_delay ? parseInt(data.schedule_delay) : null,
        schedule_unit: data.schedule_unit || null,
        is_active: data.is_active,
      };

      if (mode === 'create') {
        return api.post('/automation/rules', payload);
      } else {
        return api.put(`/automation/rules/${rule.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create'
            ? 'Automation rule created successfully'
            : 'Automation rule updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} automation rule`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: AutomationRuleFormData) => {
    // Validate JSON
    try {
      JSON.parse(data.trigger_conditions);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Invalid JSON in trigger conditions field',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const templatesList = templates?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Automation Rule' : 'Edit Automation Rule'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new automation rule to automatically perform actions based on triggers'
              : 'Update automation rule information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trigger_type">Trigger Type *</Label>
              <Select
                value={watch('trigger_type') || ''}
                onValueChange={(value) => setValue('trigger_type', value)}
              >
                <SelectTrigger className={errors.trigger_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead.created">Lead Created</SelectItem>
                  <SelectItem value="lead.updated">Lead Updated</SelectItem>
                  <SelectItem value="lead.assigned">Lead Assigned</SelectItem>
                  <SelectItem value="lead.status_changed">Lead Status Changed</SelectItem>
                  <SelectItem value="contract.created">Contract Created</SelectItem>
                  <SelectItem value="payment.received">Payment Received</SelectItem>
                </SelectContent>
              </Select>
              {errors.trigger_type && (
                <p className="text-sm text-red-500 mt-1">{errors.trigger_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="action_type">Action Type *</Label>
              <Select
                value={watch('action_type') || ''}
                onValueChange={(value) => setValue('action_type', value)}
              >
                <SelectTrigger className={errors.action_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Send Email</SelectItem>
                  <SelectItem value="sms">Send SMS</SelectItem>
                  <SelectItem value="whatsapp">Send WhatsApp</SelectItem>
                  <SelectItem value="create_followup">Create Follow-up</SelectItem>
                  <SelectItem value="schedule_visit">Schedule Visit</SelectItem>
                </SelectContent>
              </Select>
              {errors.action_type && (
                <p className="text-sm text-red-500 mt-1">{errors.action_type.message}</p>
              )}
            </div>
          </div>

          {(actionType === 'email' || actionType === 'sms' || actionType === 'whatsapp') && (
            <div>
              <Label htmlFor="template_id">Message Template *</Label>
              <Select
                value={watch('template_id') || 'none'}
                onValueChange={(value) => setValue('template_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {templatesList
                    .filter((t: any) => t.type === actionType)
                    .map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule_delay">Schedule Delay</Label>
              <Input
                id="schedule_delay"
                type="number"
                {...register('schedule_delay')}
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <Label htmlFor="schedule_unit">Schedule Unit</Label>
              <Select
                value={watch('schedule_unit') || ''}
                onValueChange={(value) => setValue('schedule_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="trigger_conditions">Trigger Conditions (JSON) *</Label>
            <Textarea
              id="trigger_conditions"
              {...register('trigger_conditions')}
              rows={8}
              className={errors.trigger_conditions ? 'border-red-500 font-mono text-sm' : 'font-mono text-sm'}
              placeholder='{"activity_source_id": null, "status_id": null, "property_type": null, "assigned_to": null}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              JSON object defining when this rule should trigger. Available fields:
              activity_source_id, status_id, property_type, assigned_to
            </p>
            {errors.trigger_conditions && (
              <p className="text-sm text-red-500 mt-1">{errors.trigger_conditions.message}</p>
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
              {mode === 'create' ? 'Create Rule' : 'Update Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

