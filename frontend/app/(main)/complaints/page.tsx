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
import { Plus, Search, MessageSquare } from 'lucide-react';

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['complaints', searchTerm],
    queryFn: () => api.get('/complaints', { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...complaints...], pagination: {...} }
  const complaints = data?.data || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints & Suggestions</h1>
          <p className="text-gray-600 mt-2">Manage tenant and landlord complaints</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search complaints..."
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
                <TableHead>Complaint No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint: any) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.complaint_no}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          complaint.type === 'complaint'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {complaint.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{complaint.title}</TableCell>
                    <TableCell>
                      {complaint.tenant?.name || complaint.landlord?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {complaint.status?.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View
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

