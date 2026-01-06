'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { FileText } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Followup Type',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <FileText className="h-4 w-4" />
        </div>
        <div className="font-medium">{item.name}</div>
      </div>
    ),
  },
  {
    key: 'followups',
    header: 'Followups',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.followups || 0} followups
      </Badge>
    ),
  },
];

export default function FollowupTypesPage() {
  return (
    <MasterDataPage
      title="Followup Types"
      description="Manage lead followup types"
      endpoint="/master-data/followup-types"
      queryKey="master-data-followup-types"
      icon={FileText}
      columns={columns}
      getCountLabel={(item) => `${item._count?.followups || 0} followups`}
    />
  );
}

