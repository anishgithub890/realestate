'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe,
  MapPin,
  Building2,
  Wrench,
  FileText,
  Users,
  Activity,
  MessageSquare,
  CheckCircle2,
  FolderOpen,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

const masterDataCategories = [
  {
    title: 'Geographic Data',
    icon: Globe,
    items: [
      { name: 'Countries', href: '/master-data/countries', icon: Globe },
      { name: 'States', href: '/master-data/states', icon: MapPin },
      { name: 'Areas', href: '/master-data/areas', icon: Building2 },
    ],
  },
  {
    title: 'Property Data',
    icon: Building2,
    items: [
      { name: 'Unit Types', href: '/master-data/unit-types', icon: Building2 },
      { name: 'Amenities', href: '/master-data/amenities', icon: Settings },
    ],
  },
  {
    title: 'Ticket Management',
    icon: Wrench,
    items: [
      { name: 'Maintenance Types', href: '/master-data/maintenance-types', icon: Wrench },
      { name: 'Maintenance Statuses', href: '/master-data/maintenance-statuses', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Complaint Management',
    icon: MessageSquare,
    items: [
      { name: 'Complaint Statuses', href: '/master-data/complaint-statuses', icon: MessageSquare },
    ],
  },
  {
    title: 'Lead Management',
    icon: Users,
    items: [
      { name: 'Lead Statuses', href: '/master-data/lead-statuses', icon: CheckCircle2 },
      { name: 'Activity Sources', href: '/master-data/activity-sources', icon: Activity },
      { name: 'Followup Types', href: '/master-data/followup-types', icon: FileText },
    ],
  },
  {
    title: 'Request Management',
    icon: FolderOpen,
    items: [
      { name: 'Request Types', href: '/master-data/request-types', icon: FolderOpen },
      { name: 'Request Statuses', href: '/master-data/request-statuses', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Document Management',
    icon: FileText,
    items: [
      { name: 'KYC Document Types', href: '/master-data/kyc-doc-types', icon: FileText },
    ],
  },
];

export default function MasterDataPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
        <p className="text-gray-600 mt-2">Manage system reference data and configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterDataCategories.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <Card key={categoryIndex} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>Manage {category.title.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link key={itemIndex} href={item.href}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <ItemIcon className="w-4 h-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

