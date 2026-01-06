'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Plug, Webhook, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks'>('integrations');

  // Fetch integrations
  const { data: integrationsData, isLoading: integrationsLoading } = useQuery<any>({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations'),
  });

  // Fetch webhooks
  const { data: webhooksData, isLoading: webhooksLoading } = useQuery<any>({
    queryKey: ['webhooks'],
    queryFn: () => api.get('/integrations/webhooks'),
  });

  const integrations = integrationsData?.data || [];
  const webhooks = webhooksData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations & Webhooks</h1>
          <p className="text-gray-600 mt-2">Connect with external services and automate workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'integrations' ? 'Add Integration' : 'Create Webhook'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'integrations' | 'webhooks')}>
        <TabsList>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  Google Ads
                </CardTitle>
                <CardDescription>Sync leads from Google Ads campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Not Connected</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  Facebook Ads
                </CardTitle>
                <CardDescription>Sync leads from Facebook Ads</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Not Connected</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  Property Portal
                </CardTitle>
                <CardDescription>Sync properties and leads from portals</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Not Connected</Badge>
              </CardContent>
            </Card>
          </div>

          {integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration: any) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">
                          {integration.integration_type}
                        </TableCell>
                        <TableCell>
                          <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                            {integration.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {integration.last_sync_at
                            ? new Date(integration.last_sync_at).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No webhooks configured. Create your first webhook to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook: any) => (
                      <TableRow key={webhook.id}>
                        <TableCell>
                          <Badge variant="outline">{webhook.event_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {webhook.url}
                        </TableCell>
                        <TableCell>
                          {webhook.last_triggered_at
                            ? new Date(webhook.last_triggered_at).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

