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
import { Plus, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contractType, setContractType] = useState<'rental' | 'sales'>('rental');

  const { data, isLoading } = useQuery<any>({
    queryKey: [`${contractType}-contracts`, searchTerm],
    queryFn: () => api.get(`/${contractType}-contracts`, { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...contracts...], pagination: {...} }
  const contracts = data?.data || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-2">Manage rental and sales contracts</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contract
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
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

      <div className="bg-white rounded-lg shadow">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tenant/Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No contracts found
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract: any) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_no}</TableCell>
                    <TableCell>
                      {format(new Date(contract.contract_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {contractType === 'rental'
                        ? contract.tenant?.name
                        : contract.buyer?.name}
                    </TableCell>
                    <TableCell>AED {contract.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

