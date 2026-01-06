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
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'requests',
    header: 'Requests',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.requests || 0} requests
      </Badge>
    ),
  },
];

export default function RequestStatusesPage() {
  return (
    <MasterDataPage
      title="Request Statuses"
      description="Manage request statuses"
      endpoint="/master-data/request-statuses"
      queryKey="master-data-request-statuses"
      icon={CheckCircle2}
      columns={columns}
      getCountLabel={(item) => `${item._count?.requests || 0} requests`}
    />
  );
}

