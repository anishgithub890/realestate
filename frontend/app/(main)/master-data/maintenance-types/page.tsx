'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Wrench } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Maintenance Type',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
          <Wrench className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'tickets',
    header: 'Tickets',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.tickets || 0} tickets
      </Badge>
    ),
  },
];

export default function MaintenanceTypesPage() {
  return (
    <MasterDataPage
      title="Maintenance Types"
      description="Manage maintenance ticket types"
      endpoint="/master-data/maintenance-types"
      queryKey="master-data-maintenance-types"
      icon={Wrench}
      columns={columns}
      getCountLabel={(item) => `${item._count?.tickets || 0} tickets`}
    />
  );
}

