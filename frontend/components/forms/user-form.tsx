'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().optional(),
  role_id: z.number().optional(),
  is_active: z.string().default('true'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  mode: 'create' | 'edit';
}

export function UserForm({ open, onOpenChange, user, mode }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role_id: undefined,
      is_active: 'true',
    },
  });

  // Reset form when user changes (for edit mode)
  useEffect(() => {
    if (user && mode === 'edit') {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: user.role_id || undefined,
        is_active: user.is_active || 'true',
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        email: '',
        phone: '',
        role_id: undefined,
        is_active: 'true',
      });
    }
  }, [user, mode, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (mode === 'create') {
        // Include company_id from authenticated user
        const payload = {
          ...data,
          company_id: currentUser?.company_id,
        };
        await api.post('/users', payload);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      } else {
        await api.put(`/users/${user.id}`, data);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new user to the system'
              : 'Update user information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

