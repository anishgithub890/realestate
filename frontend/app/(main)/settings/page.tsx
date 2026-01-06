'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Building2, Mail, Shield, Key } from 'lucide-react';
import { UserProfileForm } from '@/components/settings/user-profile-form';
import { CompanySettingsForm } from '@/components/settings/company-settings-form';
import { EmailSettingsForm } from '@/components/settings/email-settings-form';
import { SecuritySettingsForm } from '@/components/settings/security-settings-form';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery<any>({
    queryKey: ['current-user'],
    queryFn: () => api.get('/auth/me'),
  });

  // Handle errors with useEffect
  React.useEffect(() => {
    if (userError) {
      toast({
        title: 'Error',
        description: (userError as any)?.response?.data?.error || 'Failed to load user data',
        variant: 'destructive',
      });
    }
  }, [userError, toast]);

  const { data: companies, isLoading: companiesLoading } = useQuery<any>({
    queryKey: ['companies'],
    queryFn: () => api.get('/auth/companies'),
    enabled: !!currentUser,
  });

  const { data: twoFactorStatus, isLoading: twoFactorLoading } = useQuery<any>({
    queryKey: ['2fa-status'],
    queryFn: () => api.get('/2fa/status'),
    enabled: !!currentUser,
  });

  if (userLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account, company, and system preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm user={(currentUser as any)?.data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Settings
              </CardTitle>
              <CardDescription>
                Manage company information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySettingsForm 
                companies={(companies as any)?.data || []} 
                currentCompanyId={(currentUser as any)?.data?.company_id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email & SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Manage your account security and enable 2FA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm 
                twoFactorStatus={twoFactorStatus?.data}
                isLoading={twoFactorLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
