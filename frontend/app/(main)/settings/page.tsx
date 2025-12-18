'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Building2, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              User Settings
            </CardTitle>
            <CardDescription>Manage your profile and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Settings
            </CardTitle>
            <CardDescription>Company information and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Company</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Settings
            </CardTitle>
            <CardDescription>SMTP configuration and email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Configure SMTP</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Two-factor authentication and security</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Security Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

