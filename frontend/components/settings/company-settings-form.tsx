'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface CompanySettingsFormProps {
  companies?: any[];
  currentCompanyId?: number;
}

export function CompanySettingsForm({ companies = [], currentCompanyId }: CompanySettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    currentCompanyId?.toString() || ''
  );

  const selectCompanyMutation = useMutation({
    mutationFn: (companyId: number) => api.post('/auth/select-company', { company_id: companyId }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Company switched successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to switch company',
        variant: 'destructive',
      });
    },
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (companyId && parseInt(companyId) !== currentCompanyId) {
      selectCompanyMutation.mutate(parseInt(companyId));
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-gray-500">
        No companies available. Please contact your administrator.
      </div>
    );
  }

  const currentCompany = companies.find((c) => c.id === currentCompanyId);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company">Current Company</Label>
        <Select
          value={selectedCompanyId}
          onValueChange={handleCompanyChange}
          disabled={selectCompanyMutation.isPending}
        >
          <SelectTrigger id="company" className="mt-2">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          Switching companies will change your active workspace and data context.
        </p>
      </div>

      {currentCompany && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-4 h-4" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Company Name:</span>{' '}
                <span className="text-muted-foreground">{currentCompany.name}</span>
              </div>
              <div>
                <span className="font-medium">Company ID:</span>{' '}
                <span className="text-muted-foreground">{currentCompany.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          For additional company settings and configuration, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}

