import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { dashboardApi, incidentApi } from '@/services/api/endpoints';
import { formatRelativeTime } from '@/utils/formatters';
import { StatusBadge, PriorityBadge } from '@/components/shared/StatusBadges';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApi.metrics(),
    refetchInterval: 30_000,
  });

  const { data: timeseries } = useQuery({
    queryKey: ['dashboard', 'timeseries', 'incidents'],
    queryFn: () => dashboardApi.timeseries('incidents', '7d'),
  });

  const { data: heatmap } = useQuery({
    queryKey: ['dashboard', 'timeseries', 'category'],
    queryFn: () => dashboardApi.timeseries('category', '7d'),
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', { pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }],
    queryFn: () => incidentApi.list({ pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  if (metricsLoading) {
    return (
      <PageWrapper title="Dashboard">
        <PageSpinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Operations Dashboard"
      description="Live view of agent activity, SLA compliance, and incident health."
      actions={
        <Badge variant="success" dot>
          All agents online
        </Badge>
      }
    >
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Mean Time To Resolution"
          value={metrics?.mttr.value ?? '—'}
          trend={metrics?.mttr.trend ?? 0}
          icon={Clock}
          iconClassName="bg-info/10 text-info"
          positiveTrendIsGood={false}
        />
        <MetricCard
          label="SLA Compliance"
          value={metrics?.slaCompliance.value ?? '—'}
          trend={metrics?.slaCompliance.trend ?? 0}
          icon={CheckCircle2}
          iconClassName="bg-success/10 text-success"
        />
        <MetricCard
          label="Auto-Deflection Rate"
          value={metrics?.deflectionRate.value ?? '—'}
          trend={metrics?.deflectionRate.trend ?? 0}
          icon={Activity}
          iconClassName="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Total Incidents (7d)"
          value={metrics?.totalIncidents.value ?? '—'}
          trend={metrics?.totalIncidents.trend ?? 0}
          icon={Inbox}
          iconClassName="bg-secondary/10 text-secondary"
        />
        <MetricCard
          label="Open Incidents"
          value={metrics?.openIncidents.value ?? '—'}
          trend={metrics?.openIncidents.trend ?? 0}
          icon={AlertTriangle}
          iconClassName="bg-warning/10 text-warning"
          positiveTrendIsGood={false}
        />
        <MetricCard
          label="Escalation Rate"
          value={metrics?.escalationRate.value ?? '—'}
          trend={metrics?.escalationRate.trend ?? 0}
          icon={TrendingUp}
          iconClassName="bg-critical/10 text-critical"
          positiveTrendIsGood={false}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incident Volume — Last 7 Days</CardTitle>
            <CardDescription>Created vs Resolved (auto + manual)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseries ?? []}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  stroke="rgb(var(--color-muted-foreground))"
                  fontSize={11}
                />
                <YAxis stroke="rgb(var(--color-muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--color-surface))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(59 130 246)"
                  strokeWidth={2}
                  fill="url(#gCreated)"
                  name="Created"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Distribution this week</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={heatmap ?? []}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="rgb(var(--color-surface))"
                >
                  {(heatmap ?? []).map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--color-surface))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent incidents */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Incident Queue</CardTitle>
              <CardDescription>Most recent ingested tickets</CardDescription>
            </div>
            <Link
              to="/incidents"
              className="text-xs text-primary font-medium hover:underline"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="!p-0">
          <div className="divide-y divide-border">
            {(incidents?.items ?? []).map((inc) => (
              <Link
                key={inc.id}
                to={`/incidents/${inc.id}`}
                className="grid grid-cols-12 gap-3 px-6 py-3 hover:bg-surface-hover transition-colors items-center"
              >
                <div className="col-span-12 sm:col-span-5 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inc.subject}</p>
                  <p className="text-xs text-muted-foreground font-mono">{inc.id}</p>
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <PriorityBadge priority={inc.priority} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <StatusBadge status={inc.status} />
                </div>
                <div className="col-span-12 sm:col-span-2 text-xs text-muted-foreground">
                  {formatRelativeTime(inc.createdAt)}
                </div>
                <div className="hidden sm:block col-span-1 text-right text-xs text-muted-foreground">
                  {Math.round(inc.confidence * 100)}%
                </div>
              </Link>
            ))}
            {(!incidents || incidents.items.length === 0) && (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No incidents yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
