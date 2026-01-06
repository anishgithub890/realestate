'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Globe, MapPin } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'State Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          {item.authorative_name && (
            <div className="text-xs text-muted-foreground">{item.authorative_name}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'country',
    header: 'Country',
    sortable: true,
    sortKey: 'country.name',
    render: (item) => (
      <Badge variant="outline">{item.country?.name || 'N/A'}</Badge>
    ),
  },
  {
    key: 'areas',
    header: 'Areas',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.areas || 0} areas
      </Badge>
    ),
  },
];

export default function StatesPage() {
  return (
    <MasterDataPage
      title="States"
      description="Manage states"
      endpoint="/master-data/states"
      queryKey="master-data-states"
      icon={MapPin}
      columns={columns}
      getCountLabel={(item) => `${item._count?.areas || 0} areas`}
    />
  );
}

