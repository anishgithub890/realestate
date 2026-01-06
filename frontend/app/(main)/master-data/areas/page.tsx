'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Building2 } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Area Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'state',
    header: 'State',
    sortable: true,
    sortKey: 'state.name',
    render: (item) => (
      <div>
        <div className="text-sm">{item.state?.name || 'N/A'}</div>
        {item.state?.country && (
          <div className="text-xs text-muted-foreground">{item.state.country.name}</div>
        )}
      </div>
    ),
  },
  {
    key: 'buildings',
    header: 'Buildings',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.buildings || 0} buildings
      </Badge>
    ),
  },
];

export default function AreasPage() {
  return (
    <MasterDataPage
      title="Areas"
      description="Manage areas"
      endpoint="/master-data/areas"
      queryKey="master-data-areas"
      icon={Building2}
      columns={columns}
      getCountLabel={(item) => `${item._count?.buildings || 0} buildings`}
    />
  );
}

