'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';

const emailSchema = z.object({
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.string().min(1, 'SMTP port is required'),
  smtp_user: z.string().email('Invalid email address'),
  smtp_password: z.string().min(1, 'SMTP password is required'),
  smtp_secure: z.boolean().default(false),
  from_email: z.string().email('Invalid email address'),
  from_name: z.string().min(1, 'From name is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailSettingsForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      smtp_host: '',
      smtp_port: '587',
      smtp_user: '',
      smtp_password: '',
      smtp_secure: false,
      from_email: '',
      from_name: '',
    },
  });

  const smtpSecure = watch('smtp_secure');

  const onSubmit = async (data: EmailFormData) => {
    // TODO: Implement API call when backend endpoint is available
    // For now, just show a success message
    toast({
      title: 'Email Settings',
      description: 'Email configuration will be saved when the backend API is implemented.',
    });
    setIsEditing(false);
  };

  const handleTestEmail = async () => {
    // TODO: Implement test email functionality
    toast({
      title: 'Test Email',
      description: 'Test email functionality will be available when the backend API is implemented.',
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtp_host">SMTP Host *</Label>
            <Input
              id="smtp_host"
              {...register('smtp_host')}
              disabled={!isEditing}
              placeholder="smtp.gmail.com"
              className={errors.smtp_host ? 'border-red-500' : ''}
            />
            {errors.smtp_host && (
              <p className="text-sm text-red-500 mt-1">{errors.smtp_host.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="smtp_port">SMTP Port *</Label>
            <Input
              id="smtp_port"
              {...register('smtp_port')}
              disabled={!isEditing}
              placeholder="587"
              className={errors.smtp_port ? 'border-red-500' : ''}
            />
            {errors.smtp_port && (
              <p className="text-sm text-red-500 mt-1">{errors.smtp_port.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtp_user">SMTP Username (Email) *</Label>
            <Input
              id="smtp_user"
              type="email"
              {...register('smtp_user')}
              disabled={!isEditing}
              placeholder="your-email@gmail.com"
              className={errors.smtp_user ? 'border-red-500' : ''}
            />
            {errors.smtp_user && (
              <p className="text-sm text-red-500 mt-1">{errors.smtp_user.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="smtp_password">SMTP Password *</Label>
            <Input
              id="smtp_password"
              type="password"
              {...register('smtp_password')}
              disabled={!isEditing}
              placeholder="••••••••"
              className={errors.smtp_password ? 'border-red-500' : ''}
            />
            {errors.smtp_password && (
              <p className="text-sm text-red-500 mt-1">{errors.smtp_password.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from_email">From Email *</Label>
            <Input
              id="from_email"
              type="email"
              {...register('from_email')}
              disabled={!isEditing}
              placeholder="noreply@yourcompany.com"
              className={errors.from_email ? 'border-red-500' : ''}
            />
            {errors.from_email && (
              <p className="text-sm text-red-500 mt-1">{errors.from_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="from_name">From Name *</Label>
            <Input
              id="from_name"
              {...register('from_name')}
              disabled={!isEditing}
              placeholder="Your Company Name"
              className={errors.from_name ? 'border-red-500' : ''}
            />
            {errors.from_name && (
              <p className="text-sm text-red-500 mt-1">{errors.from_name.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smtp_secure"
            checked={smtpSecure}
            onChange={(e) => setValue('smtp_secure', e.target.checked)}
            disabled={!isEditing}
            className="rounded"
          />
          <Label htmlFor="smtp_secure" className="cursor-pointer">
            Use SSL/TLS (Secure Connection)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Edit Email Settings
            </Button>
          ) : (
            <>
              <Button type="submit">
              Save Email Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestEmail}
              >
                Test Email
              </Button>
            </>
          )}
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Email Configuration Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Gmail: Use port 587 with TLS or port 465 with SSL</p>
            <p>• Outlook/Hotmail: Use port 587 with TLS</p>
            <p>• Custom SMTP: Check with your email provider for correct settings</p>
            <p>• For Gmail, you may need to use an "App Password" instead of your regular password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

