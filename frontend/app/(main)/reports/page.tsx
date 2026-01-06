'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('30');

  // Fetch dashboard data for overview
  const { data: dashboardData } = useQuery<any>({
    queryKey: ['analytics-dashboard'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  // Fetch lead source performance
  const { data: sourcePerformance } = useQuery<any>({
    queryKey: ['lead-source-performance', dateRange],
    queryFn: () => api.get('/analytics/lead-source-performance', { 
      date_from: getDateFromRange(dateRange),
      date_to: new Date().toISOString(),
    }),
  });

  // Fetch conversion funnel
  const { data: conversionFunnel } = useQuery<any>({
    queryKey: ['conversion-funnel', dateRange],
    queryFn: () => api.get('/analytics/conversion-funnel', {
      date_from: getDateFromRange(dateRange),
      date_to: new Date().toISOString(),
    }),
  });

  // Fetch properties data
  const { data: propertiesData } = useQuery<any>({
    queryKey: ['properties-summary'],
    queryFn: () => api.get('/units', { limit: 1000 }),
  });

  // Fetch tenants data
  const { data: tenantsData } = useQuery<any>({
    queryKey: ['tenants-summary'],
    queryFn: () => api.get('/tenants', { limit: 1000 }),
  });

  // Fetch landlords data
  const { data: landlordsData } = useQuery<any>({
    queryKey: ['landlords-summary'],
    queryFn: () => api.get('/landlords', { limit: 1000 }),
  });

  // Fetch payments data
  const { data: paymentsData } = useQuery<any>({
    queryKey: ['payments-summary', dateRange],
    queryFn: () => api.get('/payments', { 
      limit: 1000,
      date_from: getDateFromRange(dateRange),
    }),
  });

  function getDateFromRange(days: string): string {
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    return date.toISOString();
  }

  const stats = dashboardData?.data;
  const sources = sourcePerformance?.data || [];
  const funnel = conversionFunnel?.data;
  const properties = propertiesData?.data || [];
  const tenants = tenantsData?.data || [];
  const landlords = landlordsData?.data || [];
  const payments = paymentsData?.data || [];

  const totalProperties = properties.length;
  const activeProperties = properties.filter((p: any) => p.status === 'active').length;
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t: any) => t.is_active).length;
  const totalLandlords = landlords.length;
  const activeLandlords = landlords.filter((l: any) => l.is_active).length;
  
  const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter((p: any) => p.status === 'pending').length;

  const handleExportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Report export will begin shortly',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View and generate system reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProperties} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTenants} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Landlords</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLandlords}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeLandlords} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingPayments} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Property Reports
            </CardTitle>
            <CardDescription>Property-wise reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">{totalProperties}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Active: </span>
                <span className="font-semibold text-green-600">{activeProperties}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </div>
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
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">{totalTenants}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Active: </span>
                <span className="font-semibold text-green-600">{activeTenants}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </div>
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
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">{totalLandlords}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Active: </span>
                <span className="font-semibold text-green-600">{activeLandlords}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Reports
            </CardTitle>
            <CardDescription>Payment and cheque tracking reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">AED {totalPayments.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Pending: </span>
                <span className="font-semibold text-yellow-600">{pendingPayments}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Analytics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Statistics</CardTitle>
              <CardDescription>Lead performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Leads</span>
                  <span className="text-lg font-semibold">{stats.leads?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                  <Badge variant="outline">{stats.leads?.unassigned || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today</span>
                  <span className="text-sm font-medium">{stats.leads?.today || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-sm font-medium">{stats.leads?.this_week || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium">{stats.leads?.this_month || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {funnel && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Lead conversion stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnel.stages?.map((stage: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.count} ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
