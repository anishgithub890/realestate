'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Plug, Webhook, Settings, CheckCircle2, XCircle, Edit, Trash2, RefreshCw, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookForm } from '@/components/forms/webhook-form';
import { IntegrationForm } from '@/components/forms/integration-form';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
import { StatusToggleDialog } from '@/components/data-display/status-toggle-dialog';
import { Container } from '@/components/ui/container';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
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
  const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);
  const [isIntegrationFormOpen, setIsIntegrationFormOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [webhookFormMode, setWebhookFormMode] = useState<'create' | 'edit'>('create');
  const [integrationFormMode, setIntegrationFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<{ id: number; url: string } | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ id: number; type: string } | null>(null);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [itemToToggle, setItemToToggle] = useState<{ id: number; type: 'integration' | 'webhook'; isActive: boolean; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleCreateWebhook = () => {
    setSelectedWebhook(null);
    setWebhookFormMode('create');
    setIsWebhookFormOpen(true);
  };

  const handleEditWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setWebhookFormMode('edit');
    setIsWebhookFormOpen(true);
  };

  const handleDeleteWebhook = (webhook: any) => {
    setWebhookToDelete({ id: webhook.id, url: webhook.url });
    setDeleteDialogOpen(true);
  };

  const handleConnectIntegration = (type: string) => {
    setSelectedIntegration({ integration_type: type });
    setIntegrationFormMode('create');
    setIsIntegrationFormOpen(true);
  };

  const handleEditIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setIntegrationFormMode('edit');
    setIsIntegrationFormOpen(true);
  };

  const handleDeleteIntegration = (integration: any) => {
    setIntegrationToDelete({ id: integration.id, type: integration.integration_type });
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = (item: any, type: 'integration' | 'webhook') => {
    setItemToToggle({
      id: item.id,
      type,
      isActive: item.is_active,
      name: type === 'integration' ? item.integration_type : item.url,
    });
    setStatusToggleDialogOpen(true);
  };

  const handleSyncIntegration = async (type: string) => {
    try {
      let endpoint = '';
      if (type === 'google_ads') {
        endpoint = '/integrations/google-ads/sync';
      } else if (type === 'facebook_ads') {
        endpoint = '/integrations/facebook-ads/sync';
      } else if (type === 'bayut' || type === 'property_finder') {
        endpoint = `/integrations/portals/${type}/sync`;
      } else {
        toast({
          title: 'Error',
          description: 'Sync not available for this integration type',
          variant: 'destructive',
        });
        return;
      }

      await api.post(endpoint);
      toast({
        title: 'Success',
        description: 'Integration sync started successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to sync integration',
        variant: 'destructive',
      });
    }
  };

  const handleTestWebhook = async (webhook: any) => {
    try {
      // Test webhook by sending a sample payload
      toast({
        title: 'Info',
        description: 'Webhook test functionality coming soon',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to test webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/integrations/webhooks/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete webhook',
        variant: 'destructive',
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/integrations/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Integration deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete integration',
        variant: 'destructive',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, type, isActive }: { id: number; type: 'integration' | 'webhook'; isActive: boolean }) => {
      const endpoint = type === 'integration' 
        ? `/integrations/${id}`
        : `/integrations/webhooks/${id}`;
      return api.put(endpoint, { is_active: !isActive });
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `${variables.type === 'integration' ? 'Integration' : 'Webhook'} ${variables.isActive ? 'deactivated' : 'activated'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setStatusToggleDialogOpen(false);
      setItemToToggle(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to toggle status',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (webhookToDelete) {
      deleteWebhookMutation.mutate(webhookToDelete.id);
    } else if (integrationToDelete) {
      deleteIntegrationMutation.mutate(integrationToDelete.id);
    }
  };

  const handleToggleStatusConfirm = () => {
    if (itemToToggle) {
      toggleStatusMutation.mutate({
        id: itemToToggle.id,
        type: itemToToggle.type,
        isActive: itemToToggle.isActive,
      });
    }
  };

  // Check if integration is connected
  const isIntegrationConnected = (type: string) => {
    return integrations.some((int: any) => int.integration_type === type && int.is_active);
  };

  const getIntegrationForType = (type: string) => {
    return integrations.find((int: any) => int.integration_type === type);
  };

  return (
    <Container className="py-2 sm:py-4 md:py-6 space-y-2 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">Integrations & Webhooks</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Connect with external services and automate workflows</p>
        </div>
        <Button
          onClick={activeTab === 'webhooks' ? handleCreateWebhook : undefined}
          disabled={activeTab === 'integrations'}
          size="sm"
          className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{activeTab === 'integrations' ? 'Add Integration' : 'Create Webhook'}</span>
          <span className="sm:hidden">{activeTab === 'integrations' ? 'Add' : 'Create'}</span>
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
            {[
              { type: 'google_ads', label: 'Google Ads', description: 'Sync leads from Google Ads campaigns' },
              { type: 'facebook_ads', label: 'Facebook Ads', description: 'Sync leads from Facebook Ads' },
              { type: 'zapier', label: 'Zapier', description: 'Connect with Zapier automation platform' },
              { type: 'bayut', label: 'Bayut', description: 'Sync properties and leads from Bayut portal' },
              { type: 'property_finder', label: 'Property Finder', description: 'Sync properties and leads from Property Finder' },
              { type: 'whatsapp_business', label: 'WhatsApp Business', description: 'Connect with WhatsApp Business API' },
            ].map((integration) => {
              const isConnected = isIntegrationConnected(integration.type);
              const integrationData = getIntegrationForType(integration.type);
              
              return (
                <Card 
                  key={integration.type}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (isConnected && integrationData) {
                      handleEditIntegration(integrationData);
                    } else {
                      handleConnectIntegration(integration.type);
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plug className="w-5 h-5" />
                      {integration.label}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={isConnected ? 'default' : 'outline'}>
                        {isConnected ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          'Not Connected'
                        )}
                      </Badge>
                      {isConnected && integrationData && (
                        <div className="flex gap-1">
                          {(integration.type === 'google_ads' || integration.type === 'facebook_ads' || integration.type === 'bayut' || integration.type === 'property_finder') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSyncIntegration(integration.type);
                              }}
                              title="Sync"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-6 sm:px-0">
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
                              <div className="flex items-center gap-2">
                                {(integration.integration_type === 'google_ads' || integration.integration_type === 'facebook_ads' || integration.integration_type === 'bayut' || integration.integration_type === 'property_finder') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSyncIntegration(integration.integration_type)}
                                    title="Sync Integration"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditIntegration(integration)}
                                  title="Edit Integration"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(integration, 'integration')}
                                  title={integration.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {integration.is_active ? (
                                    <XCircle className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteIntegration(integration)}
                                  title="Delete Integration"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
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
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-6 sm:px-0">
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
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditWebhook(webhook)}
                                  title="Edit Webhook"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTestWebhook(webhook)}
                                  title="Test Webhook"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(webhook, 'webhook')}
                                  title={webhook.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {webhook.is_active ? (
                                    <XCircle className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteWebhook(webhook)}
                                  title="Delete Webhook"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Webhook Form */}
      <WebhookForm
        open={isWebhookFormOpen}
        onOpenChange={setIsWebhookFormOpen}
        webhook={selectedWebhook || undefined}
        mode={webhookFormMode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['webhooks'] });
          setIsWebhookFormOpen(false);
        }}
      />

      {/* Integration Form */}
      <IntegrationForm
        open={isIntegrationFormOpen}
        onOpenChange={setIsIntegrationFormOpen}
        integration={selectedIntegration || undefined}
        mode={integrationFormMode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['integrations'] });
          setIsIntegrationFormOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={webhookToDelete ? 'Delete Webhook' : 'Delete Integration'}
        description={
          webhookToDelete
            ? `Are you sure you want to delete webhook "${webhookToDelete.url}"? This action cannot be undone.`
            : `Are you sure you want to delete integration "${integrationToDelete?.type}"? This action cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
      />

      {/* Status Toggle Dialog */}
      <StatusToggleDialog
        open={statusToggleDialogOpen}
        onOpenChange={setStatusToggleDialogOpen}
        onConfirm={handleToggleStatusConfirm}
        isActive={itemToToggle?.isActive || false}
        itemName={itemToToggle?.name || ''}
      />
    </Container>
  );
}

