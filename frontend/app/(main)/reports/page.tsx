'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, DollarSign, FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">View and generate system reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Building Reports
            </CardTitle>
            <CardDescription>Building-wise property reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Tenant Reports
            </CardTitle>
            <CardDescription>Tenant-wise reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Landlord Reports
            </CardTitle>
            <CardDescription>Landlord-wise reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Cheques Summary
            </CardTitle>
            <CardDescription>Payment and cheque tracking reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

