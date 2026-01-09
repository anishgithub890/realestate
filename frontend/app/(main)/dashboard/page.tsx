'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '@/store';
import { authService } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { 
  Building2, 
  FileText, 
  UserCheck, 
  Ticket, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  leads: {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
    unassigned: number;
  };
  conversions: {
    today: number;
    this_week: number;
    this_month: number;
  };
  top_sources: Array<{
    source: string;
    count: number;
    conversion_rate: number;
  }>;
  recent_leads: Array<{
    id: number;
    name: string;
    email: string;
    mobile_no: string;
    property_type: string;
    created_at: string;
    activity_source: {
      name: string;
    };
    assigned_user: {
      id: number;
      name: string;
    } | null;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard'),
    enabled: !!isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch additional stats
  const { data: propertiesData } = useQuery<{ success: boolean; data: any[]; pagination: any }>({
    queryKey: ['properties-count'],
    queryFn: () => api.get('/properties', { page: 1, limit: 1 }),
    enabled: !!isAuthenticated,
  });

  const { data: contractsData } = useQuery<{ success: boolean; data: any[]; pagination: any }>({
    queryKey: ['contracts-count'],
    queryFn: () => api.get('/contracts', { page: 1, limit: 1 }),
    enabled: !!isAuthenticated,
  });

  const { data: ticketsData } = useQuery<{ success: boolean; data: any[]; pagination: any }>({
    queryKey: ['tickets-count'],
    queryFn: () => api.get('/tickets', { page: 1, limit: 1 }),
    enabled: !!isAuthenticated,
  });

  useEffect(() => {
    if (!authService.isAuthenticated() || !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.data;
  const propertiesCount = propertiesData?.pagination?.total || 0;
  const contractsCount = contractsData?.pagination?.total || 0;
  const ticketsCount = ticketsData?.pagination?.total || 0;

  return (
    <Container className="py-2 sm:py-4 md:py-6 space-y-2 sm:space-y-4 md:space-y-6">
      <div className="mb-2 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Welcome back, {user.name}!</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertiesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">All properties in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Rental & sales contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leads?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.leads?.unassigned || 0} unassigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Maintenance requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.today}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.conversions.today} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.this_week}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.conversions.this_week} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.this_month}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.conversions.this_month} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned Leads</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.unassigned}</div>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Lead Sources */}
        {stats && stats.top_sources && stats.top_sources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Lead Sources</CardTitle>
              <CardDescription>Best performing lead sources this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{source.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.conversion_rate.toFixed(1)}% conversion rate
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{source.count} leads</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Leads */}
        {stats && stats.recent_leads && stats.recent_leads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest lead inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.email} • {lead.mobile_no}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {lead.property_type}
                        </Badge>
                        {lead.assigned_user ? (
                          <Badge variant="secondary" className="text-xs">
                            Assigned: {lead.assigned_user.name}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.activity_source?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {dashboardLoading && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="ml-3 text-sm text-muted-foreground">Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
