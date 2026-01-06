'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { Activity } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Source Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Activity className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'leads',
    header: 'Leads',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.leads || 0} leads
      </Badge>
    ),
  },
];

export default function ActivitySourcesPage() {
  return (
    <MasterDataPage
      title="Activity Sources"
      description="Manage lead activity sources"
      endpoint="/master-data/activity-sources"
      queryKey="master-data-activity-sources"
      icon={Activity}
      columns={columns}
      getCountLabel={(item) => `${item._count?.leads || 0} leads`}
    />
  );
}

