import { useQuery } from '@tanstack/react-query';
import { Activity, Bot, FileSearch } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { auditApi } from '@/services/api/endpoints';
import { formatRelativeTime } from '@/utils/formatters';

const targetVariant: Record<string, 'info' | 'warning' | 'success' | 'critical' | 'muted'> = {
  incident: 'info',
  runbook: 'warning',
  kb: 'success',
  escalation: 'critical',
  user: 'muted',
};

export default function AutomatedActions() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditApi.list(100),
    refetchInterval: 10_000,
  });

  return (
    <PageWrapper
      title="Automated Actions Log"
      description="Append-only audit trail of every agent decision and action."
    >
      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title="No actions logged yet"
            description="Agent activity will appear here in real-time."
          />
        </Card>
      ) : (
        <Card>
          <CardContent className="!p-0">
            <ol className="divide-y divide-border">
              {data.map((entry) => {
                const isAgent = entry.actor.toLowerCase().includes('agent');
                return (
                  <li
                    key={entry.id}
                    className="px-6 py-3 flex items-start gap-4 hover:bg-surface-hover transition-colors"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                        isAgent
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isAgent ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {entry.actor}
                        </span>
                        <Badge variant={targetVariant[entry.targetType] ?? 'muted'}>
                          {entry.targetType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5">
                        {entry.action}{' '}
                        <span className="text-muted-foreground">
                          on{' '}
                          <span className="font-mono text-foreground">{entry.target}</span>
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
