'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, GitBranch, Users, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RoutingPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'pipelines'>('rules');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch routing rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery<any>({
    queryKey: ['routing-rules'],
    queryFn: () => api.get('/routing/rules'),
  });

  // Fetch pipelines
  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery<any>({
    queryKey: ['pipelines'],
    queryFn: () => api.get('/routing/pipelines'),
  });

  const rules = rulesData?.data || [];
  const pipelines = pipelinesData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Routing & Pipelines</h1>
          <p className="text-gray-600 mt-2">Configure smart lead routing and sales pipelines</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'rules' ? 'Create Rule' : 'Create Pipeline'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rules' | 'pipelines')}>
        <TabsList>
          <TabsTrigger value="rules">
            <GitBranch className="w-4 h-4 mr-2" />
            Routing Rules
          </TabsTrigger>
          <TabsTrigger value="pipelines">
            <Target className="w-4 h-4 mr-2" />
            Pipelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routing Rules</CardTitle>
              <CardDescription>
                Automatically assign leads to users or roles based on conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No routing rules found. Create your first rule to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignment Type</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.rule_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Priority {rule.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rule.assignment_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {typeof rule.conditions === 'object' 
                              ? JSON.stringify(rule.conditions).slice(0, 50) + '...'
                              : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Active' : 'Inactive'}
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

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipelines</CardTitle>
              <CardDescription>
                Define stages and workflows for lead conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipelinesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pipelines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pipelines found. Create your first pipeline to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pipelines.map((pipeline: any) => (
                    <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{pipeline.name}</CardTitle>
                          {pipeline.is_default && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Stages: {typeof pipeline.stages === 'object' 
                              ? Object.keys(pipeline.stages).length 
                              : 'N/A'}
                          </div>
                          <Badge variant={pipeline.is_active ? 'default' : 'secondary'}>
                            {pipeline.is_active ? 'Active' : 'Inactive'}
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

