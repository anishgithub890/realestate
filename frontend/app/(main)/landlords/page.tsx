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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function LandlordsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['landlords', searchTerm],
    queryFn: () => api.get('/landlords', { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...landlords...], pagination: {...} }
  const landlords = data?.data || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landlords</h1>
          <p className="text-gray-600 mt-2">Manage landlord information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Landlord
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search landlords..."
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landlords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No landlords found
                  </TableCell>
                </TableRow>
              ) : (
                landlords.map((landlord: any) => (
                  <TableRow key={landlord.id}>
                    <TableCell className="font-medium">{landlord.name}</TableCell>
                    <TableCell>{landlord.email}</TableCell>
                    <TableCell>{landlord.mobile_no}</TableCell>
                    <TableCell>{landlord.nationality}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
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

