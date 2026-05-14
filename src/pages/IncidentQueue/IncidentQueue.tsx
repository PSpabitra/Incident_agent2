import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Filter, Plus, Search, Inbox, ArrowUpDown, ArrowUp, ArrowDown, SortAsc, SortDesc } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incidents', { debouncedSearch, status, priority }],
    queryFn: () =>
      incidentApi.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        pageSize: 100, // Fetch more items for better frontend sorting
      }),
    refetchInterval: 15_000,
  });

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    
    return [...data.items].sort((a, b) => {
      let v1: any = (a as any)[sortBy] ?? '';
      let v2: any = (b as any)[sortBy] ?? '';

      // Priority weight mapping
      if (sortBy === 'priority') {
        const weights: Record<string, number> = { 'P1': 4, 'P2': 3, 'P3': 2, 'P4': 1 };
        v1 = weights[v1] || 0;
        v2 = weights[v2] || 0;
      }
      
      // Date handling
      if (sortBy === 'createdAt') {
        v1 = new Date(v1).getTime();
        v2 = new Date(v2).getTime();
      }

      if (v1 < v2) return sortOrder === 'asc' ? -1 : 1;
      if (v1 > v2) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data?.items, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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
            <div className="h-8 w-px bg-border mx-1" />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'createdAt', label: 'Sort: Created' },
                { value: 'priority', label: 'Sort: Priority' },
                { value: 'status', label: 'Sort: Status' },
                { value: 'id', label: 'Sort: ID' },
              ]}
              containerClassName="min-w-[150px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-10 w-10 shrink-0"
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => {
                setStatus('');
                setPriority('');
                setSearch('');
                setSortBy('createdAt');
                setSortOrder('desc');
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
                  <TH 
                    className="cursor-pointer hover:text-foreground transition-colors group"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center gap-1.5">
                      ID
                      {sortBy === 'id' ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </div>
                  </TH>
                  <TH>Subject</TH>
                  <TH 
                    className="cursor-pointer hover:text-foreground transition-colors group"
                    onClick={() => toggleSort('priority')}
                  >
                    <div className="flex items-center gap-1.5">
                      PRIORITY
                      {sortBy === 'priority' ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </div>
                  </TH>
                  <TH>Status</TH>
                  <TH>Category</TH>
                  <TH>Caller</TH>
                  <TH className="text-right">Confidence</TH>
                  <TH 
                    className="text-right cursor-pointer hover:text-foreground transition-colors group"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      CREATED
                      {sortBy === 'createdAt' ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </div>
                  </TH>
                </TR>
              </THead>
              <TBody>
                {sortedItems.map((inc) => (
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
