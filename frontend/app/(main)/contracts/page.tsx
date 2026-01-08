'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, FileText, RefreshCw, History } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ContractRenewalDialog } from '@/components/contracts/contract-renewal-dialog';
import { ContractHierarchy } from '@/components/contracts/contract-hierarchy';
import { useToast } from '@/components/ui/use-toast';
import { ContractForm } from '@/components/forms/contract-form';

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contractType, setContractType] = useState<'rental' | 'sales'>('rental');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: [`${contractType}-contracts`, searchTerm],
    queryFn: () => api.get(`/contracts/${contractType}-contracts`, { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...contracts...], pagination: {...} }
  const contracts = data?.data || [];

  const handleRenew = (contract: any) => {
    setSelectedContract(contract);
    setRenewalDialogOpen(true);
  };

  const handleViewHistory = async (contract: any) => {
    try {
      // Fetch full contract details with hierarchy
      const response = await api.get<{ success: boolean; data: any }>(
        `/contracts/rental-contracts/${contract.id}`
      );
      setSelectedContract(response.data);
      setHierarchyDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load contract history',
        variant: 'destructive',
      });
    }
  };

  const handleRenewalSuccess = () => {
    refetch();
    setRenewalDialogOpen(false);
  };

  const isContractExpired = (toDate: string) => {
    return new Date(toDate) < new Date();
  };

  const isContractActive = (fromDate: string, toDate: string) => {
    const now = new Date();
    return new Date(fromDate) <= now && new Date(toDate) >= now;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-2">Manage rental and sales contracts</p>
        </div>
        <Button
          onClick={() => {
            setSelectedContract(null);
            setFormMode('create');
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contract
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant={contractType === 'rental' ? 'default' : 'outline'}
          onClick={() => setContractType('rental')}
        >
          Rental Contracts
        </Button>
        <Button
          variant={contractType === 'sales' ? 'default' : 'outline'}
          onClick={() => setContractType('sales')}
        >
          Sales Contracts
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tenant/Buyer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renewals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract: any) => {
                      const expired = isContractExpired(contract.to_date);
                      const active = isContractActive(contract.from_date, contract.to_date);
                      const renewalCount = contract.renewed_contracts?.length || 0;
                      const hasPrevious = !!contract.previous_contract;

                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {contract.contract_no}
                              {hasPrevious && (
                                <Badge variant="outline" className="text-xs">
                                  Renewal
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(contract.contract_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {contractType === 'rental'
                              ? contract.tenant?.name
                              : contract.buyer?.name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{format(new Date(contract.from_date), 'MMM dd, yyyy')}</div>
                              <div className="text-muted-foreground">
                                to {format(new Date(contract.to_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>AED {contract.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge variant="secondary">Expired</Badge>
                            ) : active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="outline">Upcoming</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {renewalCount > 0 ? (
                              <Badge variant="outline">{renewalCount} renewal(s)</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {contractType === 'rental' && (
                                <>
                                  {expired && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRenew(contract)}
                                      title="Renew Contract"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {(hasPrevious || renewalCount > 0) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewHistory(contract)}
                                      title="View Contract History"
                                    >
                                      <History className="w-4 h-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setFormMode('edit');
                                  setIsFormOpen(true);
                                }}
                                title="Edit Contract"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>

      {/* Renewal Dialog */}
      {selectedContract && (
        <ContractRenewalDialog
          open={renewalDialogOpen}
          onOpenChange={setRenewalDialogOpen}
          contract={selectedContract}
          onSuccess={handleRenewalSuccess}
        />
      )}

      {/* Contract Form Dialog */}
      <ContractForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contract={selectedContract || undefined}
        mode={formMode}
        contractType={contractType}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      {/* Hierarchy Dialog */}
      {selectedContract && (
        <Dialog open={hierarchyDialogOpen} onOpenChange={setHierarchyDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contract Renewal History</DialogTitle>
              <DialogDescription>
                Complete rental contract history showing all renewals in chronological order
              </DialogDescription>
            </DialogHeader>
            <ContractHierarchy contract={selectedContract} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
