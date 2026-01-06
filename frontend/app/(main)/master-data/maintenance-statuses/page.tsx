'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { CheckCircle2 } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Status Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'usage',
    header: 'Usage',
    sortable: false,
    render: (item) => (
      <div className="flex gap-2">
        <Badge variant="secondary">
          {item._count?.tickets || 0} tickets
        </Badge>
        <Badge variant="outline">
          {item._count?.followups || 0} followups
        </Badge>
      </div>
    ),
  },
];

export default function MaintenanceStatusesPage() {
  return (
    <MasterDataPage
      title="Maintenance Statuses"
      description="Manage maintenance ticket statuses"
      endpoint="/master-data/maintenance-statuses"
      queryKey="master-data-maintenance-statuses"
      icon={CheckCircle2}
      columns={columns}
      getCountLabel={(item) => `${(item._count?.tickets || 0) + (item._count?.followups || 0)} total`}
    />
  );
}

