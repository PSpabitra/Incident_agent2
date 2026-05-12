import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  GitBranch,
  History,
  Plus,
  Search,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { CreateContentModal } from '@/components/shared/CreateContentModal';
import { runbookApi } from '@/services/api/endpoints';
import { formatDuration, formatPercent, formatRelativeTime } from '@/utils/formatters';
import type { Runbook } from '@/types';

type TabId = 'steps' | 'history';

export default function Runbooks() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Runbook' | 'Article'>('Runbook');
  const [selected, setSelected] = useState<Runbook | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('steps');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['runbooks'],
    queryFn: () => runbookApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => runbookApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runbooks'] });
      setIsModalOpen(false);
    },
  });

  const handleCreate = async (data: { files: File[] }) => {
    if (data.files.length > 0) {
      uploadMutation.mutate(data.files[0]);
    }
  };


  
  const filtered = (data ?? []).filter(
    (rb) =>
      rb.name.toLowerCase().includes(search.toLowerCase()) ||
      rb.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageWrapper
      title="Runbook Manager"
      description="Automated remediation playbooks executed by the resolution agent."
      actions={
        <div className="flex gap-2">
         
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setModalType('Runbook');
              setIsModalOpen(true);
            }}
          >
            New Runbook
          </Button>
        </div>
      }
    >
      <CreateContentModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={uploadMutation.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-4 py-3 border-b border-border">
              <Input
                placeholder="Search runbooks…"
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CardContent className="!p-0">
              {isLoading ? (
                <PageSpinner />
              ) : filtered.length === 0 ? (
                <EmptyState icon={GitBranch} title="No runbooks" />
              ) : (
                <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                  {filtered.map((rb) => (
                    <button
                      key={rb.id}
                      onClick={() => {
                        setSelected(rb);
                        setActiveTab('steps');
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors ${
                        selected?.id === rb.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{rb.name}</p>
                        <p className="text-xs text-muted-foreground">{rb.category}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge
                            variant={rb.successRate > 0.9 ? 'success' : 'warning'}
                            className="text-[10px]"
                          >
                            <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                            {formatPercent(rb.successRate, 0)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {rb.executionCount} runs
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="px-6 py-5 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{selected.id}</p>
                      <h2 className="mt-1 text-xl font-bold text-foreground">{selected.name}</h2>
                      {/* <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p> */}
                    </div>
                    <Badge variant={selected.isActive ? 'success' : 'muted'} dot className="shrink-0">
                      {selected.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  {/* <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat icon={TrendingUp} label="Success rate" value={formatPercent(selected.successRate, 0)} />
                    <Stat icon={Clock} label="Avg duration" value={formatDuration(selected.averageDurationSeconds)} />
                    <Stat icon={GitBranch} label="Executions" value={selected.executionCount.toString()} />
                    <Stat icon={Clock} label="Updated" value={formatRelativeTime(selected.lastUpdated)} />
                  </div> */}
                </div>

                {/* ----------- Tabs ----------- */}
                <div className="flex border-b border-border px-6">
                  {(
                    [
                      { id: 'steps', label: 'Defined steps', icon: GitBranch },
                     
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        type="button"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <CardContent>
                  {activeTab === 'steps' ? (
                    <StepsTab runbook={selected} />
                  ) : (
                    <HistoryTab runbookId={selected.id} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <EmptyState
                icon={GitBranch}
                title="Select a runbook"
                description="Choose a runbook from the list to view its automated remediation steps and execution history."
              />
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

// ============================================================================
// Tabs
// ============================================================================
function StepsTab({ runbook }: { runbook: Runbook }) {
  return (
    <>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Execution Steps</p>
      <ol className="space-y-2">
        {runbook.steps.map((step) => (
          <li
            key={step.order}
            className="flex gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/30"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {step.order}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              {step.command && (
                <pre className="mt-1.5 p-2 rounded bg-foreground/5 text-[11px] font-mono text-foreground/80 overflow-x-auto">
                  {step.command}
                </pre>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function HistoryTab({ runbookId }: { runbookId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['runbook-executions', runbookId],
    queryFn: () => runbookApi.executions(runbookId, 20),
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <Spinner size="md" label="Loading execution history…" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No executions recorded yet. When this runbook runs against an incident,
        the full step trace will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Recent executions ({data.length})
      </p>
      {data.map((execution) => (
        <ExecutionCard
          key={`${execution.incident_id}-${execution.executed_at}`}
          execution={execution}
        />
      ))}
    </div>
  );
}

function ExecutionCard({
  execution,
}: {
  execution: {
    incident_id: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    executed_at: string;
    duration_s: number;
    success: boolean;
    steps: Array<{
      id: string;
      agent: string;
      action: string;
      output: string;
      type: string;
      timestamp: string;
    }>;
  };
}) {
  const [open, setOpen] = useState(false);
  const StatusIcon = execution.success ? CheckCircle2 : XCircle;

  return (
    <div className="rounded-md border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <StatusIcon
            className={`h-4 w-4 shrink-0 ${
              execution.success ? 'text-success' : 'text-critical'
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <a
                href={`/incidents/${execution.incident_id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-xs text-primary hover:underline"
              >
                {execution.incident_id}
              </a>
              <Badge
                variant={
                  execution.priority === 'P1' || execution.priority === 'P2'
                    ? 'critical'
                    : 'muted'
                }
                className="text-[10px]"
              >
                {execution.priority}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm">{execution.subject}</p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          <div>{formatDuration(execution.duration_s)}</div>
          <div>{formatRelativeTime(execution.executed_at)}</div>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            Full step trace ({execution.steps.length} steps)
          </p>
          <ol className="space-y-2">
            {execution.steps.map((step, idx) => (
              <li key={step.id} className="flex gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">{step.action}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {step.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{step.agent}</span>
                  </div>
                  {step.output && (
                    <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                      {step.output}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GitBranch;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
