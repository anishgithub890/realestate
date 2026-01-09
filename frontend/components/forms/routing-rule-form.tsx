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

const routingRuleSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required'),
  priority: z.string().min(1, 'Priority is required'),
  is_active: z.boolean().default(true),
  assignment_type: z.string().min(1, 'Assignment type is required'),
  assigned_user_id: z.string().optional(),
  assigned_role_id: z.string().optional(),
  conditions: z.string().min(1, 'Conditions are required'),
});

type RoutingRuleFormData = z.infer<typeof routingRuleSchema>;

interface RoutingRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function RoutingRuleForm({
  open,
  onOpenChange,
  rule,
  mode,
  onSuccess,
}: RoutingRuleFormProps) {
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
  } = useForm<RoutingRuleFormData>({
    resolver: zodResolver(routingRuleSchema),
    defaultValues: {
      is_active: true,
      priority: '0',
    },
  });

  // Fetch dependencies
  const { data: users } = useQuery<any>({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { limit: 1000 }),
    enabled: open,
  });

  const { data: roles } = useQuery<any>({
    queryKey: ['roles'],
    queryFn: () => api.get('/users/roles', { limit: 1000 }).catch(() => ({ data: [] })),
    enabled: open,
  });

  const { data: activitySources } = useQuery<any>({
    queryKey: ['activity-sources'],
    queryFn: () => api.get('/master-data/activity-sources', { limit: 1000 }),
    enabled: open,
  });

  const { data: areas } = useQuery<any>({
    queryKey: ['areas'],
    queryFn: () => api.get('/master-data/areas', { limit: 1000 }),
    enabled: open,
  });

  const assignmentType = watch('assignment_type');

  useEffect(() => {
    if (rule && open && mode === 'edit') {
      const conditions =
        typeof rule.conditions === 'string' ? rule.conditions : JSON.stringify(rule.conditions);
      setValue('rule_name', rule.rule_name || '');
      setValue('priority', rule.priority?.toString() || '0');
      setValue('is_active', rule.is_active !== undefined ? rule.is_active : true);
      setValue('assignment_type', rule.assignment_type || '');
      setValue('assigned_user_id', rule.assigned_user_id?.toString() || 'none');
      setValue('assigned_role_id', rule.assigned_role_id?.toString() || 'none');
      setValue('conditions', conditions);
    } else if (open && mode === 'create') {
      reset({
        is_active: true,
        priority: '0',
        conditions: JSON.stringify(
          {
            activity_source_id: null,
            property_type: null,
            interest_type: null,
            min_price: null,
            max_price: null,
            area_ids: [],
            city: null,
            state_id: null,
          },
          null,
          2
        ),
      });
    }
  }, [rule, open, mode, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data: RoutingRuleFormData) => {
      const payload: any = {
        rule_name: data.rule_name,
        priority: parseInt(data.priority),
        is_active: data.is_active,
        assignment_type: data.assignment_type,
        assigned_user_id:
          data.assigned_user_id && data.assigned_user_id !== 'none'
            ? parseInt(data.assigned_user_id)
            : null,
        assigned_role_id:
          data.assigned_role_id && data.assigned_role_id !== 'none'
            ? parseInt(data.assigned_role_id)
            : null,
        conditions: data.conditions,
      };

      if (mode === 'create') {
        return api.post('/routing/rules', payload);
      } else {
        return api.put(`/routing/rules/${rule.id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description:
          mode === 'create' ? 'Routing rule created successfully' : 'Routing rule updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} routing rule`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: RoutingRuleFormData) => {
    // Validate JSON
    try {
      JSON.parse(data.conditions);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Invalid JSON in conditions field',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  const usersList = users?.data || [];
  const rolesList = roles?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Routing Rule' : 'Edit Routing Rule'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new rule to automatically route leads based on conditions'
              : 'Update routing rule information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rule_name">Rule Name *</Label>
              <Input
                id="rule_name"
                {...register('rule_name')}
                className={errors.rule_name ? 'border-red-500' : ''}
              />
              {errors.rule_name && (
                <p className="text-sm text-red-500 mt-1">{errors.rule_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Input
                id="priority"
                type="number"
                {...register('priority')}
                className={errors.priority ? 'border-red-500' : ''}
                placeholder="Higher number = higher priority"
              />
              {errors.priority && (
                <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="assignment_type">Assignment Type *</Label>
            <Select
              value={watch('assignment_type') || ''}
              onValueChange={(value) => setValue('assignment_type', value)}
            >
              <SelectTrigger className={errors.assignment_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific_user">Specific User</SelectItem>
                <SelectItem value="round_robin">Round Robin</SelectItem>
                <SelectItem value="load_balance">Load Balance</SelectItem>
                <SelectItem value="role_based">Role Based</SelectItem>
              </SelectContent>
            </Select>
            {errors.assignment_type && (
              <p className="text-sm text-red-500 mt-1">{errors.assignment_type.message}</p>
            )}
          </div>

          {assignmentType === 'specific_user' && (
            <div>
              <Label htmlFor="assigned_user_id">Assigned User *</Label>
              <Select
                value={watch('assigned_user_id') || 'none'}
                onValueChange={(value) => setValue('assigned_user_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {usersList.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(assignmentType === 'round_robin' ||
            assignmentType === 'load_balance' ||
            assignmentType === 'role_based') && (
            <div>
              <Label htmlFor="assigned_role_id">Assigned Role *</Label>
              <Select
                value={watch('assigned_role_id') || 'none'}
                onValueChange={(value) => setValue('assigned_role_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {rolesList.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="conditions">Conditions (JSON) *</Label>
            <Textarea
              id="conditions"
              {...register('conditions')}
              rows={12}
              className={errors.conditions ? 'border-red-500 font-mono text-sm' : 'font-mono text-sm'}
              placeholder='{"activity_source_id": null, "property_type": null, "interest_type": null, "min_price": null, "max_price": null, "area_ids": [], "city": null, "state_id": null}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              JSON object defining routing conditions. Available fields: activity_source_id,
              property_type, interest_type, min_price, max_price, area_ids (array), city, state_id
            </p>
            {errors.conditions && (
              <p className="text-sm text-red-500 mt-1">{errors.conditions.message}</p>
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

