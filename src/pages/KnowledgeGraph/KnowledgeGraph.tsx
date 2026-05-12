/**
 * Knowledge Graph browser.
 *
 * Three-column UI:
 *  - Stats banner across the top
 *  - Node list (filterable by type/category) on the left
 *  - Selected node detail on the right (edges + incidents that taught it)
 */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpenCheck,
  Brain,
  ChevronRight,
  Network,
  Search,
  Stethoscope,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { EmptyState } from '@/components/shared/EmptyState';
import { KnowledgeGraphApi, type KGNode, type NodeType } from '@/services/api/knowledge_graph';
import { formatRelativeTime } from '@/utils/formatters';

const NODE_TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Symptoms', value: 'symptom' },
  { label: 'Causes', value: 'cause' },
  { label: 'Resolutions', value: 'resolution' },
];

const NODE_ICON: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  symptom: Stethoscope,
  cause: AlertCircle,
  resolution: Wrench,
};

const NODE_COLOR: Record<NodeType, string> = {
  symptom: 'text-info',
  cause: 'text-warning',
  resolution: 'text-success',
};

export default function KnowledgeGraph() {
  const [nodeType, setNodeType] = useState<'' | NodeType>('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statsQ = useQuery({
    queryKey: ['kg-stats'],
    queryFn: () => KnowledgeGraphApi.stats(),
  });

  const nodesQ = useQuery({
    queryKey: ['kg-nodes', nodeType],
    queryFn: () => KnowledgeGraphApi.listNodes({ nodeType: nodeType || undefined, limit: 200 }),
  });

  const detailQ = useQuery({
    queryKey: ['kg-node', selectedId],
    queryFn: () => KnowledgeGraphApi.getNode(selectedId!),
    enabled: !!selectedId,
  });

  const filtered = useMemo(() => {
    const all = nodesQ.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.category ?? '').toLowerCase().includes(q) ||
        (n.keywords ?? []).some((k) => k.toLowerCase().includes(q)),
    );
  }, [nodesQ.data, search]);

  return (
    <PageWrapper
      title="Knowledge Graph"
      description="Symptom → cause → resolution paths the agent has learned from human-resolved incidents."
    >
      {/* ----------------- Stats row ------------------------------------ */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Stat
          icon={Stethoscope}
          label="Symptoms"
          value={statsQ.data?.symptoms ?? 0}
          color="text-info"
        />
        <Stat
          icon={AlertCircle}
          label="Causes"
          value={statsQ.data?.causes ?? 0}
          color="text-warning"
        />
        <Stat
          icon={Wrench}
          label="Resolutions"
          value={statsQ.data?.resolutions ?? 0}
          color="text-success"
        />
        <Stat
          icon={Network}
          label="Total edges"
          value={statsQ.data?.totalEdges ?? 0}
          color="text-primary"
        />
        <Stat
          icon={BookOpenCheck}
          label="Successful applications"
          value={statsQ.data?.successfulApplications ?? 0}
          color="text-success"
        />
        <Stat
          icon={Brain}
          label="Total nodes"
          value={statsQ.data?.totalNodes ?? 0}
          color="text-foreground"
        />
      </div>

      {/* ----------------- Node list + detail --------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-3 border-b border-border p-3">
              <Input
                placeholder="Search nodes…"
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                options={NODE_TYPE_OPTIONS}
                value={nodeType}
                onChange={(e) => setNodeType((e.target.value as NodeType) || '')}
              />
            </div>
            <CardContent className="!p-0">
              {nodesQ.isLoading ? (
                <PageSpinner />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Network}
                  title="No graph nodes yet"
                  description="Nodes appear after a human resolves their first incident."
                />
              ) : (
                <div className="max-h-[70vh] divide-y divide-border overflow-y-auto">
                  {filtered.map((node) => (
                    <NodeListItem
                      key={node.id}
                      node={node}
                      isSelected={selectedId === node.id}
                      onSelect={() => setSelectedId(node.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedId && detailQ.data ? (
            <NodeDetail detail={detailQ.data} />
          ) : (
            <Card className="p-12 text-center">
              <Network className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-medium">Pick a node to explore</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Symptoms link to causes, which link to resolutions. Click any
                node on the left to see its connections and the incidents that
                contributed to it.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

// ============================================================================
// Bits
// ============================================================================
function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </Card>
  );
}

function NodeListItem({
  node,
  isSelected,
  onSelect,
}: {
  node: KGNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = NODE_ICON[node.nodeType];
  const color = NODE_COLOR[node.nodeType];
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
        isSelected ? 'bg-primary/5' : ''
      }`}
      type="button"
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{node.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{node.nodeType}</span>
          {node.category && <span>· {node.category}</span>}
          <Badge variant={node.confidence >= 0.7 ? 'success' : 'muted'} className="text-[10px]">
            <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
            {Math.round(node.confidence * 100)}%
          </Badge>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function NodeDetail({ detail }: { detail: ReturnType<typeof useTypeHelper> }) {
  const { node, outgoingEdges, incomingEdges, relatedIncidents } = detail;
  const Icon = NODE_ICON[node.nodeType];
  const color = NODE_COLOR[node.nodeType];

  return (
    <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-start gap-3">
            <Icon className={`mt-1 h-5 w-5 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted-foreground">{node.id}</p>
              <h2 className="mt-1 break-words text-xl font-bold">{node.label}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="muted" className="capitalize">
                  {node.nodeType}
                </Badge>
                {node.category && <Badge variant="info">{node.category}</Badge>}
                <Badge variant={node.confidence >= 0.7 ? 'success' : 'warning'}>
                  Confidence {Math.round(node.confidence * 100)}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {node.occurrenceCount} occurrence{node.occurrenceCount === 1 ? '' : 's'} · seen{' '}
                  {formatRelativeTime(node.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="space-y-5">
          {node.description && (
            <section>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="text-sm">{node.description}</p>
            </section>
          )}

          {/* ----- Steps (only resolutions) ----------------------------- */}
          {node.nodeType === 'resolution' && (node.steps?.length ?? 0) > 0 && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Resolution steps
              </p>
              <ol className="space-y-2">
                {node.steps!.map((step) => (
                  <li
                    key={step.order}
                    className="flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {step.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{step.title}</p>
                      {step.detail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                      )}
                      {step.source && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          source: {step.source}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ----- Keywords --------------------------------------------- */}
          {node.keywords?.length > 0 && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {node.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ----- Outcomes (only resolutions) -------------------------- */}
          {node.nodeType === 'resolution' && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Outcomes
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border p-2">
                  <div className="text-success text-lg font-bold">{node.successCount}</div>
                  <div className="text-xs text-muted-foreground">successful applications</div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-critical text-lg font-bold">{node.failureCount}</div>
                  <div className="text-xs text-muted-foreground">failures</div>
                </div>
              </div>
            </section>
          )}

          {/* ----- Edges ------------------------------------------------ */}
          {outgoingEdges.length > 0 && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Leads to
              </p>
              <ul className="space-y-1">
                {outgoingEdges.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{e.edgeType}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span>{e.dstLabel}</span>
                    <Badge variant="muted" className="text-[10px]">
                      ×{e.evidenceCount}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {incomingEdges.length > 0 && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Reached from
              </p>
              <ul className="space-y-1">
                {incomingEdges.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <span>{e.srcLabel}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">{e.edgeType}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ----- Related incidents ------------------------------------ */}
          {relatedIncidents.length > 0 && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Incidents that contributed
              </p>
              <ul className="space-y-1.5">
                {relatedIncidents.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm"
                  >
                    <a
                      href={`/incidents/${r.incident_id}`}
                      className="text-primary hover:underline"
                    >
                      {r.incident_id}
                    </a>
                    <span className="flex-1 truncate text-muted-foreground">{r.subject}</span>
                    <Badge variant="muted" className="text-[10px]">
                      {r.role}
                    </Badge>
                    {r.was_successful != null && (
                      <Badge
                        variant={r.was_successful ? 'success' : 'critical'}
                        className="text-[10px]"
                      >
                        {r.was_successful ? '✓' : '✗'}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper to give the NodeDetail param a clean type without re-declaring.
type NodeDetailType = Awaited<ReturnType<typeof KnowledgeGraphApi.getNode>>;
function useTypeHelper(): NodeDetailType {
  return null as unknown as NodeDetailType;
}
