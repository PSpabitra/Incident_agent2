import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {  Search, Inbox, ArrowUpDown, ArrowUp, ArrowDown, SortAsc, SortDesc } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge, PriorityBadge, SourceBadge } from '@/components/shared/StatusBadges';
import { CreateIncidentModal } from './CreateIncidentModal';
import { useDebounce } from '@/hooks/useDebounce';
import { incidentApi } from '@/services/api/endpoints';
import { formatDateTime, truncate } from '@/utils/formatters';

export default function IncidentQueue() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incidents', { debouncedSearch, status, priority, page }],
    queryFn: () =>
      incidentApi.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        pageSize: 6,
        page,
      }),
    refetchInterval: 15_000,
  });

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];

    return [...data.items].sort((a, b) => {
      let v1: any = (a as any)[sortBy] ?? '';
      let v2: any = (b as any)[sortBy] ?? '';

      if (sortBy === 'priority') {
        const weights: Record<string, number> = { 'P1': 4, 'P2': 3, 'P3': 2, 'P4': 1 };
        v1 = weights[v1] || 0;
        v2 = weights[v2] || 0;
      }

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
      noScroll
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 border-emerald-100">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </Badge>
        </div>
      }
    >
      <div className="h-full flex flex-col space-y-6 overflow-hidden">
        
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-soft-sm bg-white">
          <div className="p-4 border-b border-border flex-none">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by subject, caller, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { label: 'All statuses', value: '' },
                    { label: 'New', value: 'new' },
                    { label: 'Analyzing', value: 'analyzing' },
                    { label: 'Escalated', value: 'escalated' },
                    { label: 'Resolved', value: 'resolved' },
                  ]}
                  className="w-[140px] h-10"
                />
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { label: 'All priorities', value: '' },
                    { label: 'P1 - Critical', value: 'P1' },
                    { label: 'P2 - High', value: 'P2' },
                    { label: 'P3 - Medium', value: 'P3' },
                    { label: 'P4 - Low', value: 'P4' },
                  ]}
                  className="w-[140px] h-10"
                />
                
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { label: 'Sort: Created', value: 'createdAt' },
                      { label: 'Sort: Priority', value: 'priority' },
                      { label: 'Sort: Confidence', value: 'confidence' },
                    ]}
                    className="w-[140px] h-8 border-none bg-transparent shadow-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                    title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-blue-600" /> : <SortDesc className="h-4 w-4 text-blue-600" />}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus('');
                    setPriority('');
                    setSearch('');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className="h-10 px-4 font-bold tracking-widest text-[10px] text-slate-500 border-slate-200"
                >
                  CLEAR
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="!p-0 flex-1 overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <PageSpinner />
              </div>
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No incidents found"
                description="Try adjusting your filters or create a new incident."
              />
            ) : (
              <>
                <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <Table className="border-none border-separate border-spacing-0">
                    <THead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                      <TR>
                        <TH 
                          className="cursor-pointer hover:text-foreground transition-colors group px-4 py-3"
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
                        <TH className="px-4 py-3">Subject</TH>
                        <TH
                          className="cursor-pointer hover:text-foreground transition-colors group px-4 py-3"
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
                        <TH className="px-4 py-3">Status</TH>
                        <TH className="px-4 py-3">Source</TH>
                        <TH className="px-4 py-3">Category</TH>
                        <TH className="px-4 py-3">Caller</TH>
                        {/* <TH className="text-right px-4 py-3">Confidence</TH> */}
                        <TH
                          className="text-right cursor-pointer hover:text-foreground transition-colors group px-4 py-3"
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
                        <TR key={inc.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                          <TD className="font-mono text-xs text-muted-foreground px-4 py-4">
                            <Link to={`/incidents/${inc.id}`} className="hover:text-primary">
                              {inc.id}
                            </Link>
                          </TD>
                          <TD className="px-4 py-4">
                            <Link
                              to={`/incidents/${inc.id}`}
                              className="font-medium hover:text-primary block"
                            >
                              {truncate(inc.subject, 60)}
                            </Link>
                          </TD>
                          <TD className="px-4 py-4">
                            <PriorityBadge priority={inc.priority} />
                          </TD>
                          <TD className="px-4 py-4">
                            <StatusBadge status={inc.status} />
                          </TD>
                          <TD className="px-4 py-4">
                            <SourceBadge source={inc.source} />
                          </TD>
                          <TD className="text-sm text-muted-foreground px-4 py-4 whitespace-nowrap">{inc.category}</TD>
                          <TD className="text-sm px-4 py-4 whitespace-nowrap">{inc.caller}</TD>
                          {/* <TD className="text-right tabular-nums text-sm font-medium px-4 py-4">
                            {Math.round(inc.confidence * 100)}%
                          </TD> */}
                          <TD className="text-right text-[11px] text-muted-foreground whitespace-nowrap px-4 py-4">
                            {formatDateTime(inc.createdAt)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-border flex items-center justify-between bg-white flex-none">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Page {page} of {Math.ceil((data?.total || 0) / 5)} — {(data?.total || 0)} Total
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 text-[10px] font-bold tracking-widest px-3 border-slate-200"
                    >
                      PREVIOUS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={!data?.hasMore}
                      className="h-8 text-[10px] font-bold tracking-widest px-3 border-slate-200"
                    >
                      NEXT
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
