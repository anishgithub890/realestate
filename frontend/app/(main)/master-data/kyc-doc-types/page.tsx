'use client';

import { MasterDataPage } from '@/components/master-data/master-data-page';
import { FileText } from 'lucide-react';
import type { Column } from '@/components/data-display/data-table';
import { Badge } from '@/components/ui/badge';

const columns: Column<any>[] = [
  {
    key: 'name',
    header: 'Document Type',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          {item.is_mandatory === 'true' && (
            <Badge variant="destructive" className="mt-1 text-xs">
              Mandatory
            </Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'mandatory',
    header: 'Mandatory',
    sortable: true,
    render: (item) => (
      <Badge variant={item.is_mandatory === 'true' ? 'destructive' : 'outline'}>
        {item.is_mandatory === 'true' ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'documents',
    header: 'Documents',
    sortable: false,
    render: (item) => (
      <Badge variant="secondary">
        {item._count?.documents || 0} documents
      </Badge>
    ),
  },
];

export default function KycDocTypesPage() {
  return (
    <MasterDataPage
      title="KYC Document Types"
      description="Manage KYC document types"
      endpoint="/master-data/kyc-doc-types"
      queryKey="master-data-kyc-doc-types"
      icon={FileText}
      columns={columns}
      getCountLabel={(item) => `${item._count?.documents || 0} documents`}
    />
  );
}

