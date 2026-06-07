import { useAuth } from '@/components/auth.provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserDashboard } from '@rest/api';
import {
  Building2,
  Calendar,
  Car,
  Clock,
  CreditCard,
  LayoutDashboard,
  LucideCreditCard,
  MapPin,
  MapPinPlus,
  Navigation,
  Podcast,
  Settings,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RouteKey } from '@/navigation/route';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';

type RecentActivityItem = {
  type?: 'new_user' | 'transaction' | 'rental' | string;
  description?: string;
  timestamp?: string;
  meta?: Record<string, unknown>;
};

export default function UserDashboardPage(): React.ReactNode {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data: userDashboardData } = useGetUserDashboard();

  const stats = userDashboardData?.stats;
  const activeBookings = userDashboardData?.activeBookings ?? [];
  const recentActivity = (userDashboardData?.recentActivity ?? []) as RecentActivityItem[];

  const chartData = useMemo(
    () =>
      (userDashboardData?.revenueHistory ?? []).map((entry) => ({
        month: entry.month ?? '',
        revenue: entry.revenue ?? 0,
      })),
    [userDashboardData?.revenueHistory]
  );

  const avg = chartData.length
    ? Math.round(chartData.reduce((sum, d) => sum + (d.revenue ?? 0), 0) / chartData.length)
    : 0;

  const chartConfig = {
    revenue: {
      label: 'Revenue ($)',
      color: 'hsl(var(--chart-1))',
    },
  };

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '$0';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeDays = (value?: string | null) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diffInDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (diffInDays > 1) {
      return `${diffInDays} days left`;
    }

    if (diffInDays === 1) {
      return '1 day left';
    }

    if (diffInDays === 0) {
      return 'Starts today';
    }

    return `${Math.abs(diffInDays)} days ago`;
  };

  const getStatusStyles = (status?: string) => {
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'confirmed') {
      return 'bg-green-500/20 text-green-700 hover:bg-green-500/30';
    }

    if (normalized === 'pending') {
      return 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30';
    }

    return 'bg-muted text-muted-foreground hover:bg-muted';
  };

  const getRecentActivityVisual = (type?: string) => {
    if (type === 'new_user') {
      return { dotClassName: 'bg-green-500' };
    }

    if (type === 'transaction') {
      return { dotClassName: 'bg-blue-500' };
    }

    return { dotClassName: 'bg-cyan-500' };
  };

  const quickActions = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
      path: RouteKey.User.Dashboard.key,
      variant: 'default' as const,
      className:
        'w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500/90 hover:via-blue-600/90 hover:to-purple-700/90',
    },
    {
      label: 'Car Rental',
      icon: <MapPinPlus className="w-4 h-4 mr-2" />,
      path: RouteKey.User.CarRental.key,
      variant: 'outline' as const,
      className: 'w-full',
    },
    {
      label: 'Car Posting',
      icon: <Podcast className="w-4 h-4 mr-2" />,
      path: RouteKey.User.CarPosting.key,
      variant: 'outline' as const,
      className: 'w-full',
    },
    {
      label: 'Car Management',
      icon: <Car className="w-4 h-4 mr-2" />,
      path: RouteKey.User.QuickCar.key,
      variant: 'outline' as const,
      className: 'w-full',
    },
    {
      label: 'Company Config',
      icon: <Building2 className="w-4 h-4 mr-2" />,
      path: RouteKey.User.CompanyConfig.key,
      variant: 'outline' as const,
      className: 'w-full',
    },
    {
      label: 'Accounts',
      icon: <LucideCreditCard className="w-4 h-4 mr-2" />,
      path: RouteKey.User.Account.key,
      variant: 'outline' as const,
      className: 'w-full',
    },
  ];

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeBookings?.value ?? 0}</div>
              <p
                className={`text-xs ${stats?.activeBookings?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {stats?.activeBookings?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrips?.value ?? 0}</div>
              <p
                className={`text-xs ${stats?.totalTrips?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {stats?.totalTrips?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSpent?.formatted ?? formatCurrency(stats?.totalSpent?.value ?? 0)}
              </div>
              <p
                className={`text-xs ${stats?.totalSpent?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {stats?.totalSpent?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avgRating?.value?.toFixed(2) ?? '0.00'}
              </div>
              <p
                className={`text-xs ${stats?.avgRating?.isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {stats?.avgRating?.change ?? '+0.0%'} from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Monthly rental revenue from your active fleet</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillUserRevenue" x1="0" y1="0" x2="0" y2="1">
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
                        tickFormatter={(v) => formatCurrency(Number(v))}
                      />

                      <ReferenceLine
                        y={avg}
                        stroke="#97A0AF"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                      />

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
                        fill="url(#fillUserRevenue)"
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
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No revenue history available yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Current Bookings
                </CardTitle>
                <CardDescription>Your active and upcoming reservations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => {
                    const car = booking.car_posting?.car;
                    const company = car?.user_company;
                    const title = `${car?.brand ?? 'Car'} ${car?.model ?? ''}`.trim();
                    const mediaOriginalUrl = (
                      car as { media?: Array<{ original_url?: string }> } | undefined
                    )?.media?.[0]?.original_url;
                    const carImageUrl = mediaOriginalUrl ?? car?.image_url;

                    return (
                      <div
                        key={booking.id ?? `${booking.car_posting_id}-${booking.start_date}`}
                        className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            {carImageUrl ? (
                              <img
                                src={carImageUrl}
                                alt={title || 'Car image'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                <Car className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {title || `Rental #${booking.id ?? booking.car_posting_id}`}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {company?.city ?? company?.name ?? 'Location unavailable'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(booking.start_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusStyles(booking.rental_status)}>
                            {(booking.rental_status ?? 'status').toString()}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDays(booking.return_date ?? booking.start_date)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No active bookings right now.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.path}
                    variant={action.variant}
                    className={action.className}
                    onClick={() => navigate(action.path)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
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

                    return (
                      <div
                        key={`${activity.timestamp ?? 'activity'}-${index}`}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className={`w-2 h-2 rounded-full ${visual.dotClassName}`} />
                        <div className="min-w-0">
                          <p className="text-foreground truncate">
                            {activity.description ?? 'Activity update'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
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
