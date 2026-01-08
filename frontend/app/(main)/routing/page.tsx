'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, GitBranch, Users, Target, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoutingRuleForm } from '@/components/forms/routing-rule-form';
import { PipelineForm } from '@/components/forms/pipeline-form';
import { DeleteConfirmDialog } from '@/components/data-display/delete-confirm-dialog';
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
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [isPipelineFormOpen, setIsPipelineFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [ruleFormMode, setRuleFormMode] = useState<'create' | 'edit'>('create');
  const [pipelineFormMode, setPipelineFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'rule' | 'pipeline' } | null>(null);
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

  const handleCreateRule = () => {
    setSelectedRule(null);
    setRuleFormMode('create');
    setIsRuleFormOpen(true);
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setRuleFormMode('edit');
    setIsRuleFormOpen(true);
  };

  const handleDeleteRule = (rule: any) => {
    setItemToDelete({ id: rule.id, name: rule.rule_name, type: 'rule' });
    setDeleteDialogOpen(true);
  };

  const handleCreatePipeline = () => {
    setSelectedPipeline(null);
    setPipelineFormMode('create');
    setIsPipelineFormOpen(true);
  };

  const handleEditPipeline = (pipeline: any) => {
    setSelectedPipeline(pipeline);
    setPipelineFormMode('edit');
    setIsPipelineFormOpen(true);
  };

  const handleDeletePipeline = (pipeline: any) => {
    setItemToDelete({ id: pipeline.id, name: pipeline.name, type: 'pipeline' });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'rule') {
        await api.delete(`/routing/rules/${itemToDelete.id}`);
        toast({
          title: 'Success',
          description: 'Routing rule deleted successfully',
        });
      } else {
        await api.delete(`/routing/pipelines/${itemToDelete.id}`);
        toast({
          title: 'Success',
          description: 'Pipeline deleted successfully',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Routing & Pipelines</h1>
          <p className="text-gray-600 mt-2">Configure smart lead routing and sales pipelines</p>
        </div>
        <Button
          onClick={activeTab === 'rules' ? handleCreateRule : handleCreatePipeline}
        >
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
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-6 sm:px-0">
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
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRule(rule)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRule(rule)}
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
                            Stages:{' '}
                            {(() => {
                              try {
                                const stages =
                                  typeof pipeline.stages === 'string'
                                    ? JSON.parse(pipeline.stages)
                                    : pipeline.stages;
                                return Array.isArray(stages) ? stages.length : 'N/A';
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </div>
                          <Badge variant={pipeline.is_active ? 'default' : 'secondary'}>
                            {pipeline.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPipeline(pipeline)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePipeline(pipeline)}
                              className="flex-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
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

      {/* Routing Rule Form */}
      <RoutingRuleForm
        open={isRuleFormOpen}
        onOpenChange={setIsRuleFormOpen}
        rule={selectedRule || undefined}
        mode={ruleFormMode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
          setIsRuleFormOpen(false);
        }}
      />

      {/* Pipeline Form */}
      <PipelineForm
        open={isPipelineFormOpen}
        onOpenChange={setIsPipelineFormOpen}
        pipeline={selectedPipeline || undefined}
        mode={pipelineFormMode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['pipelines'] });
          setIsPipelineFormOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${itemToDelete?.type === 'rule' ? 'Routing Rule' : 'Pipeline'}`}
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

