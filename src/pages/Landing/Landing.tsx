/**
 * Landing page — public, describes the project and links to login.
 *
 * Reachable at `/welcome`. Login.tsx links here under "About this project".
 */
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  GitBranch,
  Mail,
  Network,
  Plug,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/layout/Header/ThemeToggle';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============================================================ Nav */}
      <header className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Intelligent Incident Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Bot className="h-3 w-3" /> Autonomous incident response
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Tickets that{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              fix themselves.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            An AI agent platform that ingests incidents from your ITSM systems,
            analyses them with Mistral, applies learned resolutions automatically,
            and escalates only the cases that genuinely need a human. Every human
            fix becomes a knowledge graph entry that resolves the next similar
            ticket in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Open the console
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </a>
          </div>
        </motion.div>

        {/* ----- Stats row ------------------------------------------------- */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Agents', value: '5' },
            { label: 'Connectors', value: '5' },
            { label: 'LLM-powered', value: 'Mistral' },
            { label: 'Auto-learning', value: 'Yes' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div className="text-xl font-bold sm:text-2xl">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================== Capabilities */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">What it does</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Five specialised agents work together. Each does one job well; the
            orchestrator hands off between them and persists every decision so
            you have a full audit trail.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Capability
              icon={Plug}
              title="Multi-system ingestion"
              body="Pulls tickets from Jira, ServiceNow, Salesforce, HubSpot and Zoho via OAuth + webhooks. Auto-sync runs every minute; webhooks fire instantly."
            />
            <Capability
              icon={Brain}
              title="Mistral-powered triage"
              body="Every incoming ticket gets analysed by Mistral. The LLM hypothesises a root cause, drafts resolution steps, and rates how safely they can be run unattended."
            />
            <Capability
              icon={Workflow}
              title="Runbook execution"
              body="The Resolution agent matches incidents against a runbook library via TF-IDF similarity, then executes the steps with verification checks."
            />
            <Capability
              icon={Network}
              title="Knowledge graph learning"
              body="When a human resolves a ticket, the system extracts symptom → cause → resolution nodes and edges. The next time a similar incident arrives, the graph resolves it instantly."
            />
            <Capability
              icon={Mail}
              title="P1/P2 email escalation"
              body="High-priority incidents that the agent can't resolve trigger an SMTP email to the on-call engineer with full diagnostic context and an AI-written summary."
            />
            <Capability
              icon={Activity}
              title="Audit-grade timeline"
              body="Every agent step is recorded with type (observe / reason / plan / act / evaluate), metadata, and timing. Read the full thinking trace for any incident."
            />
          </div>
        </div>
      </section>

      {/* ==================================================== How it works */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">How a ticket flows through it</h2>

          <ol className="mt-10 space-y-6">
            {flowSteps.map((step, idx) => (
              <li key={step.title} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {idx + 1}
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <step.icon className="h-4 w-4 text-primary" />
                    {step.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================ Tech */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Built on</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {techStack.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="font-semibold">{t.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================== CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to see your incidents resolve themselves?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign in to the console. Demo credentials are pre-filled — no setup required.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Sign in
              </Button>
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Credentials are encrypted at rest with Fernet (key-rotation supported).
          </div>
        </div>
      </section>

      {/* ============================================================ Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <span>© Intelligent Incident Agent</span>
          <span>v1.0 — FastAPI · React 18 · MySQL · Celery · Mistral AI</span>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Bits
// ============================================================================
function Capability({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-lg border border-border bg-surface p-5"
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  );
}

const flowSteps = [
  {
    icon: Plug,
    title: 'Ingestion',
    body:
      'Webhook or user chat hits the API. The Ingestion agent normalises the payload, links it to the source connector, and creates an incident.',
  },
  {
    icon: GitBranch,
    title: 'Triage',
    body:
      'A TF-IDF classifier predicts category and severity. Critical keywords ("prod", "outage", "down") bump priority. SLA deadlines are computed.',
  },
  {
    icon: Brain,
    title: 'Mistral analysis',
    body:
      'The LLM reads the description and emits a structured JSON: root cause hypothesis, confidence, ordered resolution steps, and whether the fix is safe to run unattended.',
  },
  {
    icon: Network,
    title: 'Knowledge graph match',
    body:
      'The Resolution agent first checks the knowledge graph — has a near-identical incident been resolved before? If yes, the historical fix runs immediately.',
  },
  {
    icon: Workflow,
    title: 'Runbook fallback',
    body:
      'If the graph has no match, runbook semantic search picks the best playbook by category + similarity. Steps execute with verification checks.',
  },
  {
    icon: Mail,
    title: 'Escalation + email',
    body:
      'If neither path produces high confidence, the incident escalates. For P1/P2 the engineer gets an SMTP email with the LLM summary, diagnostic context, and a deep link.',
  },
  {
    icon: Zap,
    title: 'Learning loop',
    body:
      "When the engineer resolves it, the system extracts a symptom-cause-resolution path into the knowledge graph. Next similar ticket: auto-resolved. The system gets smarter every week.",
  },
];

const techStack = [
  { name: 'React 18 + TS', role: 'Frontend' },
  { name: 'FastAPI', role: 'API server' },
  { name: 'Mistral AI', role: 'LLM analysis' },
  { name: 'MySQL', role: 'Persistent store' },
  { name: 'Celery + Redis', role: 'Async + scheduled work' },
  { name: 'scikit-learn', role: 'Classification + similarity' },
  { name: 'Fernet (cryptography)', role: 'Encrypted credentials' },
  { name: 'Tailwind + Framer', role: 'UI + motion' },
];
