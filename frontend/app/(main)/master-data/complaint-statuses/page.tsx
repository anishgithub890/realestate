'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { MessageSquare } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Status Name',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
          <MessageSquare className="h-4 w-4" />
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
          {item._count?.complaints || 0} complaints
        </Badge>
        <Badge variant="outline">
          {item._count?.followups || 0} followups
        </Badge>
      </div>
    ),
  },
];

export default function ComplaintStatusesPage() {
  return (
    <MasterDataPage
      title="Complaint Statuses"
      description="Manage complaint statuses"
      endpoint="/master-data/complaint-statuses"
      queryKey="master-data-complaint-statuses"
      icon={MessageSquare}
      columns={columns}
      getCountLabel={(item) => `${(item._count?.complaints || 0) + (item._count?.followups || 0)} total`}
    />
  );
}

