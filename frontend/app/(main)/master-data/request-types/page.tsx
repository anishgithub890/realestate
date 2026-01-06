'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { FolderOpen } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Request Type',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
          <FolderOpen className="h-4 w-4" />
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

export default function RequestTypesPage() {
  return (
    <MasterDataPage
      title="Request Types"
      description="Manage request types"
      endpoint="/master-data/request-types"
      queryKey="master-data-request-types"
      icon={FolderOpen}
      columns={columns}
      getCountLabel={(item) => `${item._count?.requests || 0} requests`}
    />
  );
}

