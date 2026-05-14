import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  Eye,
  Lightbulb,
  PlayCircle,
  AlertOctagon,
  Workflow,
  Mail,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge, PriorityBadge } from '@/components/shared/StatusBadges';
import { incidentApi } from '@/services/api/endpoints';
import { KnowledgeGraphApi } from '@/services/api/knowledge_graph';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import type { AgentStep } from '@/types';

const stepIcons: Record<AgentStep['type'], typeof Eye> = {
  observe: Eye,
  reason: Lightbulb,
  plan: Workflow,
  act: PlayCircle,
  evaluate: CheckCircle2,
};

const stepColors: Record<AgentStep['type'], string> = {
  observe: 'text-info bg-info/10 border-info/30',
  reason: 'text-secondary bg-secondary/10 border-secondary/30',
  plan: 'text-accent bg-accent/10 border-accent/30',
  act: 'text-warning bg-warning/10 border-warning/30',
  evaluate: 'text-success bg-success/10 border-success/30',
};

export default function IncidentDetails() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentApi.detail(id),
    enabled: !!id,
    refetchInterval: 8_000,
  });

  const triageMutation = useMutation({
    mutationFn: () => incidentApi.triage(id),
    onSuccess: () => {
      success('Triage complete', 'Agent has classified and prioritised this incident.');
      qc.invalidateQueries({ queryKey: ['incidents', id] });
    },
    onError: (e) => error('Triage failed', e instanceof Error ? e.message : ''),
  });

  const resolveMutation = useMutation({
    mutationFn: () => incidentApi.resolve(id),
    onSuccess: () => {
      success('Incident resolved');
      qc.invalidateQueries({ queryKey: ['incidents', id] });
    },
    onError: (e) => error('Resolve failed', e instanceof Error ? e.message : ''),
  });

  const escalateMutation = useMutation({
    mutationFn: () => incidentApi.escalate(id, 'Manual escalation by operator'),
    onSuccess: () => {
      success('Escalated to engineering queue');
      qc.invalidateQueries({ queryKey: ['incidents', id] });
    },
    onError: (e) => error('Escalation failed', e instanceof Error ? e.message : ''),
  });

  if (isLoading || !incident) {
    return (
      <PageWrapper>
        <PageSpinner />
      </PageWrapper>
    );
  }

  const slaPct = incident.slaDeadline
    ? Math.min(
        100,
        ((Date.now() - new Date(incident.createdAt).getTime()) /
          (new Date(incident.slaDeadline).getTime() - new Date(incident.createdAt).getTime())) *
          100,
      )
    : 0;

  return (
    <PageWrapper bare>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{incident.id}</span>
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
              {incident.autoResolved && (
                <Badge variant="success" dot>
                  Auto-resolved
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {incident.subject}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Reported by <span className="font-medium text-foreground">{incident.caller}</span>
              {incident.callerEmail && (
                <>
                  {' '}
                  · <span className="font-mono">{incident.callerEmail}</span>
                </>
              )}{' '}
              · {formatDateTime(incident.createdAt)}
            </p>
          </div>
          {/* <div className="flex flex-wrap gap-2">
            {incident.status !== 'resolved' && incident.status !== 'closed' && (
              <>
                <Button
                  variant="outline"
                  leftIcon={<Bot className="h-4 w-4" />}
                  onClick={() => triageMutation.mutate()}
                  isLoading={triageMutation.isPending}
                >
                  Re-run Triage
                </Button>
                <Button
                  variant="success"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => resolveMutation.mutate()}
                  isLoading={resolveMutation.isPending}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="danger"
                  leftIcon={<AlertOctagon className="h-4 w-4" />}
                  onClick={() => escalateMutation.mutate()}
                  isLoading={escalateMutation.isPending}
                >
                  Escalate
                </Button>
              </>
            )}
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {incident.description}
                </p>
              </CardContent>
            </Card>

            <MistralAnalysisCard incidentId={incident.id} />

            {/* Agent timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Reasoning Timeline</CardTitle>
                <CardDescription>
                  Observe → Reason → Plan → Act → Evaluate. Real-time agent decisions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incident.steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No agent activity yet.
                  </p>
                ) : (
                  <ol className="relative border-l-2 border-border ml-3 space-y-5">
                    {incident.steps.map((step, idx) => {
                      const Icon = stepIcons[step.type];
                      const colorClass = stepColors[step.type];
                      return (
                        <motion.li
                          key={step.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="ml-6"
                        >
                          <span
                            className={`absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full border-2 ${colorClass} bg-surface`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">
                                {step.agent}
                              </span>
                              <Badge variant="muted" className="uppercase text-[10px]">
                                {step.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(step.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {step.action}
                            </p>
                            <p className="mt-1 text-sm text-foreground bg-muted/40 rounded-md px-3 py-2 border border-border">
                              {step.output}
                            </p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SLA Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time elapsed</span>
                    <span className="font-medium tabular-nums">
                      {formatRelativeTime(incident.createdAt)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        slaPct > 80
                          ? 'bg-critical'
                          : slaPct > 50
                            ? 'bg-warning'
                            : 'bg-success'
                      }`}
                      style={{ width: `${slaPct}%` }}
                    />
                  </div>
                  {incident.slaBreached ? (
                    <Badge variant="critical" dot>
                      SLA breached
                    </Badge>
                  ) : (
                    <Badge variant="success" dot>
                      Within SLA
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Category" value={incident.category} />
                <Field label="Subcategory" value={incident.subcategory ?? '—'} />
                <Field label="Source" value={incident.source} />
                <Field
                  label="AI Confidence"
                  value={`${Math.round(incident.confidence * 100)}%`}
                />
                <Field label="Severity" value={incident.severity} />
                {incident.tags.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {incident.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
{/* 
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/runbooks"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Workflow className="h-4 w-4" /> Browse runbooks
                </Link>
                <Link
                  to="/knowledge-base"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Lightbulb className="h-4 w-4" /> Search knowledge base
                </Link>
                <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="h-4 w-4" /> Notify caller
                </button>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <Clock className="inline h-3 w-3 mr-1" /> Created{' '}
                  {formatDateTime(incident.createdAt)}
                </p>
                <p>
                  <Clock className="inline h-3 w-3 mr-1" /> Updated{' '}
                  {formatDateTime(incident.updatedAt)}
                </p>
                {incident.resolvedAt && (
                  <p>
                    <CheckCircle2 className="inline h-3 w-3 mr-1 text-success" /> Resolved{' '}
                    {formatDateTime(incident.resolvedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}

// ============================================================================
// Mistral Analysis card — surfaces the LLM's analysis of the incident
// ============================================================================
function MistralAnalysisCard({ incidentId }: { incidentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['mistral-analyses', incidentId],
    queryFn: () => KnowledgeGraphApi.listAnalyses(incidentId),
  });

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  // Show the most recent successful analysis (the agent always writes the
  // most recent one first since the table is ordered DESC).
  const analysis = data.find((a) => !a.error) ?? data[0];

  if (analysis.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-warning" /> Automated Agent Analysis
          </CardTitle>
          <CardDescription>The agent step encountered an error.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{analysis.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-primary" /> Automated Agent Analysis
          {/* <Badge variant={analysis.confidence >= 0.7 ? 'success' : 'warning'}>
            {Math.round(analysis.confidence * 100)}% confidence
          </Badge> */}
        </CardTitle>
        {/* <CardDescription>
          Agent step · {analysis.latencyMs}ms ·{' '}
          {analysis.tokensIn + analysis.tokensOut} tokens
        </CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.rootCause && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Hypothesised root cause
            </p>
            <p className="text-sm font-medium">{analysis.rootCause}</p>
          </div>
        )}

        {analysis.resolutionSummary && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Resolution plan
            </p>
            <p className="text-sm">{analysis.resolutionSummary}</p>
          </div>
        )}

        {analysis.suggestedSteps.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Suggested steps
            </p>
            <ol className="space-y-1.5">
              {analysis.suggestedSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex gap-2 text-sm rounded-md border border-border bg-muted/30 px-3 py-1.5"
                >
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
