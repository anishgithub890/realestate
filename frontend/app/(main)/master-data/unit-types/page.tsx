'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Building2 } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Unit Type Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'units',
    header: 'Units',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.units || 0} units
      </Badge>
    ),
  },
];

export default function UnitTypesPage() {
  return (
    <MasterDataPage
      title="Unit Types"
      description="Manage property unit types"
      endpoint="/master-data/unit-types"
      queryKey="master-data-unit-types"
      icon={Building2}
      columns={columns}
      getCountLabel={(item) => `${item._count?.units || 0} units`}
    />
  );
}

