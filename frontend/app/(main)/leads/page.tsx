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
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { LeadForm } from '@/components/forms/lead-form';
import { useToast } from '@/components/ui/use-toast';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ['leads', searchTerm],
    queryFn: () => api.get('/leads', { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...leads...], pagination: {...} }
  const leads = (data as any)?.data || [];

  const handleCreate = () => {
    setSelectedLead(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage property inquiries and leads</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search leads..."
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
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {lead.mobile_no}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.property_type}</TableCell>
                    <TableCell>{lead.interest_type}</TableCell>
                    <TableCell>
                      AED {lead.min_price?.toLocaleString()} - {lead.max_price?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {lead.status?.name || 'New'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        View/Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <LeadForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lead={selectedLead}
        mode={formMode}
      />
    </div>
  );
}

