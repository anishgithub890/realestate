'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.string().optional(),
  target_scope: z.string().optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function AnnouncementForm({ open, onOpenChange, announcement, mode, onSuccess }: AnnouncementFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    if (announcement && open && mode === 'edit') {
      setValue('title', announcement.title);
      setValue('message', announcement.message);
      setValue('type', announcement.type || '');
      setValue('target_scope', announcement.target_scope || '');
      setValue('is_active', announcement.is_active);
      setValue('start_date', announcement.start_date ? announcement.start_date.split('T')[0] : '');
      setValue('end_date', announcement.end_date ? announcement.end_date.split('T')[0] : '');
    } else if (open && mode === 'create') {
      reset();
      setValue('is_active', true);
    }
  }, [announcement, open, mode, setValue, reset]);

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: data.title,
        message: data.message,
        is_active: data.is_active !== undefined ? data.is_active : true,
      };

      if (data.type) payload.type = data.type;
      if (data.target_scope) payload.target_scope = data.target_scope;
      if (data.start_date) payload.start_date = data.start_date;
      if (data.end_date) payload.end_date = data.end_date;

      if (mode === 'create') {
        await api.post('/announcements', payload);
        toast({
          title: 'Success',
          description: 'Announcement created successfully',
        });
      } else {
        await api.put(`/announcements/${announcement.id}`, payload);
        toast({
          title: 'Success',
          description: 'Announcement updated successfully',
        });
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${mode} announcement`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Announcement' : 'Edit Announcement'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new announcement for users'
              : 'Update announcement information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <textarea
              id="message"
              {...register('message')}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Enter announcement message..."
            />
            {errors.message && (
              <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch('type') || ''}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_scope">Target Scope</Label>
              <Select
                value={watch('target_scope') || ''}
                onValueChange={(value) => setValue('target_scope', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="tenants">Tenants Only</SelectItem>
                  <SelectItem value="landlords">Landlords Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded"
              defaultChecked={true}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
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
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Announcement'
                : 'Update Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

