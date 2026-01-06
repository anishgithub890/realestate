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
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          {item.category && (
            <div className="text-xs text-muted-foreground">Category: {item.category}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    render: (item) => (
      <Badge variant="outline">{item.category || 'N/A'}</Badge>
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

export default function LeadStatusesPage() {
  return (
    <MasterDataPage
      title="Lead Statuses"
      description="Manage lead statuses"
      endpoint="/master-data/lead-statuses"
      queryKey="master-data-lead-statuses"
      icon={CheckCircle2}
      columns={columns}
      getCountLabel={(item) => `${item._count?.leads || 0} leads`}
    />
  );
}

