import { useAuth } from '@/components/auth.provider';
import MachineInfo from '@/components/MachineInfo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAdminDashboard, useGetMachineInfo } from '@rest/api';
import {
  Car,
  ChartArea,
  CreditCard,
  MapPin,
  Navigation,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import type React from 'react';

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

export default function AdminDashboardPage(): React.ReactNode {
  type RecentActivityType = 'new_user' | 'transaction' | 'rental';
  type RecentActivityItem = {
    type?: RecentActivityType;
    description?: string;
    timestamp?: string;
    meta?: {
      email?: string;
    };
  };

  const { role } = useAuth();
  const { data: machineInfo, isLoading } = useGetMachineInfo({
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: adminDashboardData } = useGetAdminDashboard();

  // 1. Define your mock or dynamic data
  const chartData = useMemo(() => adminDashboardData?.revenueHistory ?? [], [adminDashboardData]);
  const recentActivity = useMemo(
    () =>
      (
        adminDashboardData as
          | {
              recentActivity?: RecentActivityItem[];
            }
          | undefined
      )?.recentActivity ?? [],
    [adminDashboardData]
  );

  const avg = Math.round(chartData.reduce((sum, d) => sum + d.revenue!, 0) / chartData.length);

  const getRecentActivityVisual = (type?: RecentActivityType) => {
    if (type === 'new_user') {
      return {
        dotClassName: 'bg-green-500',
        icon: <UserPlus className="h-3.5 w-3.5 text-green-600" />,
      };
    }

    if (type === 'transaction') {
      return {
        dotClassName: 'bg-blue-500',
        icon: <CreditCard className="h-3.5 w-3.5 text-blue-600" />,
      };
    }

    return {
      dotClassName: 'bg-cyan-500',
      icon: <Car className="h-3.5 w-3.5 text-cyan-600" />,
    };
  };

  const formatActivityTime = (timestamp?: string) => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString();
  };

  // 2. Define the chart config for shadcn/ui
  const chartConfig = {
    revenue: {
      label: 'Revenue ($)',
      color: 'hsl(var(--chart-1))', // Matches your theme's chart variables
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your bookings and explore new destinations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
            >
              <Users className="w-4 h-4 mr-1" />
              {role}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Machine Info */}
        <div className="my-6">
          <MachineInfo data={machineInfo} loading={isLoading} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminDashboardData?.stats?.newUsers?.value ?? 0}
              </div>
              <p
                className={`text-xs ${adminDashboardData?.stats?.newUsers?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {adminDashboardData?.stats?.newUsers?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Renewals</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminDashboardData?.stats?.subscriptionRenewals?.value ?? 0}
              </div>
              <p
                className={`text-xs ${adminDashboardData?.stats?.subscriptionRenewals?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {adminDashboardData?.stats?.subscriptionRenewals?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminDashboardData?.stats?.monthlyRevenue?.formatted ?? '$0'}
              </div>
              <p
                className={`text-xs ${adminDashboardData?.stats?.monthlyRevenue?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {adminDashboardData?.stats?.monthlyRevenue?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminDashboardData?.stats?.activeRentals?.value ?? 0}
              </div>
              <p
                className={`text-xs ${adminDashboardData?.stats?.activeRentals?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {adminDashboardData?.stats?.activeRentals?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Bookings */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartArea className="w-5 h-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Total revenue generated every month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 3. The shadcn/ui Chart Container */}
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0052CC" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0052CC" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />

                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={48}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />

                    {/* Average reference line */}
                    <ReferenceLine y={avg} stroke="#97A0AF" strokeDasharray="4 3" strokeWidth={1} />

                    <ChartTooltip
                      cursor={{ stroke: '#0052CC', strokeWidth: 1, strokeDasharray: '4 3' }}
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value) => `$${Number(value).toLocaleString()}`}
                        />
                      }
                    />

                    <Area
                      dataKey="revenue"
                      type="monotone"
                      stroke="#0052CC"
                      strokeWidth={2}
                      fill="url(#fillRevenue)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: '#0052CC',
                        stroke: 'white',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500/90 hover:via-blue-600/90 hover:to-purple-700/90">
                  <Car className="w-4 h-4 mr-2" />
                  Book New Car
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Locations
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const visual = getRecentActivityVisual(activity.type);
                    const timeLabel = formatActivityTime(activity.timestamp);

                    return (
                      <div
                        key={`${activity.timestamp ?? activity.description ?? 'activity'}-${index}`}
                      >
                        <div className="flex items-start gap-3 text-sm">
                          <div className={`mt-1 h-2 w-2 rounded-full ${visual.dotClassName}`}></div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {visual.icon}
                              <span className="text-muted-foreground">
                                {activity.description ?? 'Recent activity'}
                              </span>
                            </div>
                            {activity.meta?.email ? (
                              <p className="text-xs text-muted-foreground/80">
                                {activity.meta.email}
                              </p>
                            ) : null}
                            {timeLabel ? (
                              <p className="text-xs text-muted-foreground/70">{timeLabel}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
