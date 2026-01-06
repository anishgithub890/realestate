'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Settings } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Amenity Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">
          <Settings className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'units',
    header: 'Used In Units',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.unit_amenities || 0} units
      </Badge>
    ),
  },
];

export default function AmenitiesPage() {
  return (
    <MasterDataPage
      title="Amenities"
      description="Manage property amenities"
      endpoint="/master-data/amenities"
      queryKey="master-data-amenities"
      icon={Settings}
      columns={columns}
      getCountLabel={(item) => `${item._count?.unit_amenities || 0} units`}
    />
  );
}

