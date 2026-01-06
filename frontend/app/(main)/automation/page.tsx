'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, Mail, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'templates'>('rules');

  // Fetch automation rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery<any>({
    queryKey: ['automation-rules'],
    queryFn: () => api.get('/automation/rules'),
  });

  // Fetch message templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery<any>({
    queryKey: ['message-templates'],
    queryFn: () => api.get('/automation/templates'),
  });

  const rules = rulesData?.data || [];
  const templates = templatesData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-600 mt-2">Automated follow-ups and workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'rules' ? 'Create Rule' : 'Create Template'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rules' | 'templates')}>
        <TabsList>
          <TabsTrigger value="rules">
            <Zap className="w-4 h-4 mr-2" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Mail className="w-4 h-4 mr-2" />
            Message Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Automatically send follow-ups and perform actions based on triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No automation rules found. Create your first rule to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Trigger Type</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.trigger_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rule.action_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {rule.schedule_delay && rule.schedule_unit ? (
                            <span className="text-sm">
                              {rule.schedule_delay} {rule.schedule_unit}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Immediate</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Email and SMS templates for automated communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found. Create your first template to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template: any) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {template.subject && (
                            <div className="text-sm">
                              <span className="font-medium">Subject: </span>
                              <span>{template.subject}</span>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {template.body}
                          </div>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

