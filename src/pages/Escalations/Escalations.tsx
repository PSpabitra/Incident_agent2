import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { escalationApi } from '@/services/api/endpoints';
import { formatRelativeTime } from '@/utils/formatters';
import { PriorityBadge } from '@/components/shared/StatusBadges';

const statusColors: Record<string, 'critical' | 'warning' | 'info' | 'success'> = {
  pending: 'critical',
  acknowledged: 'warning',
  in_progress: 'info',
  resolved: 'success',
};

const ITEMS_PER_PAGE = 5;

export default function Escalations() {
  const { data, isLoading } = useQuery({
    queryKey: ['escalations'],
    queryFn: () => escalationApi.list(),
    refetchInterval: 20_000,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = data ? Math.ceil(data.length / ITEMS_PER_PAGE) : 0;
  const paginatedData = data
    ? data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <PageWrapper
      title="Engineer Escalations"
      description="Complex incidents auto-escalated by the agent with full diagnostic context."
    >
      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertOctagon}
            title="No active escalations"
            description="The agent has resolved everything autonomously. Nice."
          />
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedData.map((esc, idx) => (
            <motion.div
              key={esc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{esc.id}</span>
                        <span>→</span>
                        <Link
                          to={`/incidents/${esc.incidentId}`}
                          className="text-primary hover:underline"
                        >
                          {esc.incidentId}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1.5">{esc.reason}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={esc.priority} />
                      <Badge variant={statusColors[esc.status] ?? 'muted'} dot>
                        {esc.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Diagnostic Summary
                    </p>
                    <p className="text-sm text-foreground bg-muted/40 rounded-md px-3 py-2 border border-border">
                      {esc.diagnostic}
                    </p>
                  </div>
                  {esc.attemptedActions.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                        Attempted Actions
                      </p>
                      <ul className="space-y-1">
                        {esc.attemptedActions.map((a, i) => (
                          <li key={i} className="text-sm text-foreground flex gap-2">
                            <span className="text-muted-foreground">•</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {esc.assignedEngineer ? (
                          <>
                            Assigned to{' '}
                            <span className="font-medium text-foreground">
                              {esc.assignedEngineer}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · escalated {formatRelativeTime(esc.createdAt)}
                      </span>
                    </div>
                    <Link to={`/incidents/${esc.incidentId}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        Open
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
