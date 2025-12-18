'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['units', searchTerm],
    queryFn: () => api.get('/units', { search: searchTerm }),
  });

  // Backend returns: { success: true, data: [...units...], pagination: {...} }
  const units = data?.data || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage properties and units</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading properties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No properties found
            </div>
          ) : (
            units.map((unit: any) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{unit.name}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {unit.building?.name}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        unit.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Area:</span>
                      <span className="font-medium">{unit.gross_area_in_sqft} sqft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bedrooms:</span>
                      <span className="font-medium">{unit.no_of_bedrooms || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rent:</span>
                      <span className="font-medium">
                        {unit.basic_rent ? `AED ${unit.basic_rent.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/properties/${unit.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

