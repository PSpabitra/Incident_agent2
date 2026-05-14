import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Filter, Plus, Search, Inbox } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge, PriorityBadge } from '@/components/shared/StatusBadges';
import { CreateIncidentModal } from './CreateIncidentModal';
import { useDebounce } from '@/hooks/useDebounce';
import { incidentApi } from '@/services/api/endpoints';
import { formatRelativeTime, truncate } from '@/utils/formatters';

export default function IncidentQueue() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incidents', { debouncedSearch, status, priority }],
    queryFn: () =>
      incidentApi.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        pageSize: 50,
      }),
    refetchInterval: 15_000,
  });

  return (
    <PageWrapper
      title="Incident Queue"
      description="All incidents ingested by the agent — auto-refreshing every 15s."

    >
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-4 py-3 border-b border-border">
          <Input
            placeholder="Search by subject, caller, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            containerClassName="flex-1"
          />
          <div className="flex items-center gap-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'new', label: 'New' },
                { value: 'analyzing', label: 'Analyzing' },
                { value: 'remediating', label: 'Remediating' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'escalated', label: 'Escalated' },
                { value: 'closed', label: 'Closed' },
              ]}
              containerClassName="min-w-[140px]"
            />
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: '', label: 'All priorities' },
                { value: 'P1', label: 'P1 — Critical' },
                { value: 'P2', label: 'P2 — High' },
                { value: 'P3', label: 'P3 — Medium' },
                { value: 'P4', label: 'P4 — Low' },
              ]}
              containerClassName="min-w-[140px]"
            />
            <Button
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => {
                setStatus('');
                setPriority('');
                setSearch('');
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <CardContent className="!p-0">
          {isLoading ? (
            <PageSpinner />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No incidents found"
              description="Try adjusting your filters or create a new incident."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Subject</TH>
                  <TH>Priority</TH>
                  <TH>Status</TH>
                  <TH>Category</TH>
                  <TH>Caller</TH>
                  <TH className="text-right">Confidence</TH>
                  <TH className="text-right">Created</TH>
                </TR>
              </THead>
              <TBody>
                {data.items.map((inc) => (
                  <TR key={inc.id} className="cursor-pointer">
                    <TD className="font-mono text-xs text-muted-foreground">
                      <Link to={`/incidents/${inc.id}`} className="hover:text-primary">
                        {inc.id}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {truncate(inc.subject, 60)}
                      </Link>
                    </TD>
                    <TD>
                      <PriorityBadge priority={inc.priority} />
                    </TD>
                    <TD>
                      <StatusBadge status={inc.status} />
                    </TD>
                    <TD className="text-sm text-muted-foreground">{inc.category}</TD>
                    <TD className="text-sm">{inc.caller}</TD>
                    <TD className="text-right tabular-nums text-sm font-medium">
                      {Math.round(inc.confidence * 100)}%
                    </TD>
                    <TD className="text-right text-xs text-muted-foreground">
                      {formatRelativeTime(inc.createdAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateIncidentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </PageWrapper>
  );
}
