'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  Download,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('30');
  const [reportType, setReportType] = useState<string>('overview');

  // Fetch dashboard data
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

  // Fetch ad campaigns
  const { data: campaignsData } = useQuery<any>({
    queryKey: ['ad-campaigns'],
    queryFn: () => api.get('/analytics/campaigns'),
  });

  function getDateFromRange(days: string): string {
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    return date.toISOString();
  }

  const stats = dashboardData?.data;
  const sources = sourcePerformance?.data || [];
  const funnel = conversionFunnel?.data;
  const campaigns = campaignsData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
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
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnel?.overall_conversion_rate 
                ? `${funnel.overall_conversion_rate.toFixed(1)}%`
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {funnel?.converted_leads || 0} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_response_time 
                ? `${stats.avg_response_time.toFixed(1)}h`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter((c: any) => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Running campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Source Performance</CardTitle>
            <CardDescription>Top performing lead sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sources.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                sources.map((source: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {source.conversion_rate.toFixed(1)}% conversion
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(source.conversion_rate, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{source.count} leads</span>
                        <span>{source.converted} converted</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead conversion stages</CardDescription>
          </CardHeader>
          <CardContent>
            {funnel ? (
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
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ad Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Advertising Campaigns</CardTitle>
          <CardDescription>Campaign performance and ROI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No campaigns found</p>
            ) : (
              campaigns.map((campaign: any) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{campaign.campaign_name}</h3>
                      <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                        {campaign.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span className="font-medium">{campaign.source}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="font-medium">AED {campaign.budget?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Leads: </span>
                        <span className="font-medium">{campaign.leads_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conversions: </span>
                        <span className="font-medium">{campaign.conversions}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View ROI
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

