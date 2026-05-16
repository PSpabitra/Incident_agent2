/**
 * Connectors list page.
 *
 * Two sections:
 *   1. Configured connectors (status, last-sync, click-to-open)
 *   2. Available providers catalog (click → create modal)
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Cloud,
  CloudCog,
  Loader2,
  Plus,
  Server,
  Trello,
} from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useToast } from '@/hooks/useToast';
import {
  ConnectorsApi,
  type Connector,
  type ConnectorProvider,
  type ConnectorStatus,
} from '@/services/api/connectors';
import { formatRelativeTime } from '@/utils/formatters';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trello: Trello,
  server: Server,
  cloud: Cloud,
  briefcase: Briefcase,
  'cloud-cog': CloudCog,
};

const statusVariant: Record<ConnectorStatus, 'success' | 'warning' | 'critical' | 'muted'> = {
  connected: 'success',
  connecting: 'warning',
  disconnected: 'muted',
  error: 'critical',
  expired: 'critical',
};

export function Connectors() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [creatingForProvider, setCreatingForProvider] = useState<ConnectorProvider | null>(null);

  const providersQ = useQuery({
    queryKey: ['connector-providers'],
    queryFn: ConnectorsApi.listProviders,
  });
  const connectorsQ = useQuery({
    queryKey: ['connectors'],
    queryFn: () => ConnectorsApi.list(),
  });

  const handlePick = (p: ConnectorProvider) => {
    setCreatingForProvider(p);
  };

  const isLoading = providersQ.isLoading || connectorsQ.isLoading;

  return (
    <PageWrapper
      title="Connectors"
      description="Connect external ITSM and CRM systems for bidirectional sync."
    >
      {isLoading ? (
        <PageSpinner label="Loading connectors…" />
      ) : (
        <>
          <ConfiguredSection
            connectors={connectorsQ.data ?? []}
            providers={providersQ.data ?? []}
            onOpen={(c) => navigate(`/connectors/${c.id}`)}
          />
          <CatalogSection
            providers={providersQ.data ?? []}
            onPick={handlePick}
          />
        </>
      )}

      {creatingForProvider && (
        <CreateConnectorModal
          provider={creatingForProvider}
          onClose={() => setCreatingForProvider(null)}
          onCreated={async (connector) => {
            setCreatingForProvider(null);
            await qc.invalidateQueries({ queryKey: ['connectors'] });
            toast.success(
              `Created ${connector.name}`,
              'Click "Connect" on the next screen to authorize.',
            );
            navigate(`/connectors/${connector.id}`);
          }}
        />
      )}
    </PageWrapper>
  );
}

// ============================================================ Configured ===
function ConfiguredSection({
  connectors,
  providers,
  onOpen,
}: {
  connectors: Connector[];
  providers: ConnectorProvider[];
  onOpen: (c: Connector) => void;
}) {
  const providerByKey = new Map(providers.map((p) => [p.provider, p]));
  if (connectors.length === 0) {
    return (
      <Card className="mb-8 p-8 text-center">
        <p className="text-muted-foreground">
          No connectors configured yet. Pick one from the catalog below.
        </p>
      </Card>
    );
  }
  return (
    <section className="mb-12">
      <h2 className="mb-3 text-lg font-semibold">Configured</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {connectors.map((c) => {
          const meta = providerByKey.get(c.provider);
          const Icon = (meta && ICON_MAP[meta.icon]) ?? Cloud;
          return (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            >
              <Card
                className="cursor-pointer p-4"
                onClick={() => onOpen(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpen(c);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {meta?.display_name ?? c.provider}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {c.last_synced_at ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      last sync {formatRelativeTime(c.last_synced_at)}
                    </span>
                  ) : (
                    <span className="opacity-70">never synced</span>
                  )}
                  {c.last_error && (
                    <span className="inline-flex items-center gap-1 text-critical">
                      <AlertCircle className="h-3 w-3" />
                      {c.last_error.slice(0, 40)}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// =============================================================== Catalog ===
function CatalogSection({
  providers,
  onPick,
}: {
  providers: ConnectorProvider[];
  onPick: (p: ConnectorProvider) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Available providers</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((p) => {
          const Icon = ICON_MAP[p.icon] ?? Cloud;
          const isPending = false; // We don't have isCreatingJira anymore in this context
          return (
            <Card key={p.provider} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{p.display_name}</h3>
                    <Badge variant={p.maturity === 'production' ? 'success' : 'warning'}>
                      {p.maturity === 'production' ? 'Production' : 'Scaffold'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <a
                      href={p.docs_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Provider docs ↗
                    </a>
                    <Button
                      size="sm"
                      leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      onClick={() => onPick(p)}
                      disabled={isPending}
                    >
                      {isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// ========================================================= Create modal ===
function CreateConnectorModal({
  provider,
  onClose,
  onCreated,
}: {
  provider: ConnectorProvider;
  onClose: () => void;
  onCreated: (c: Connector) => void;
}) {
  const [name, setName] = useState(`${provider.display_name} `);
  const [config, setConfig] = useState<Record<string, string>>(() => {
    const baseFields = [...provider.required_config];
    if (provider.provider === 'jira') {
      // Ensure these are present for Jira
      if (!baseFields.includes('site_url')) baseFields.push('site_url');
      if (!baseFields.includes('project_key')) baseFields.push('project_key');
      if (!baseFields.includes('auth_type')) baseFields.push('auth_type');
    }
    const initial = Object.fromEntries(baseFields.map((k) => [k, '']));
    if (provider.provider === 'jira') {
      initial.site_url = '';
      initial.project_key = '';
      initial.auth_type = 'basic';
    }
    return initial;
  });

  const requiredFields = provider.provider === 'jira' 
    ? Array.from(new Set([...provider.required_config, 'site_url', 'project_key', 'auth_type']))
    : provider.required_config;


  const create = useMutation({
    mutationFn: () =>
      ConnectorsApi.create({
        provider: provider.provider,
        name,
        config,
        sync_enabled: true,
        poll_interval_sec: 120,
      }),
    onSuccess: onCreated,
  });

  const updateConfig = (key: string, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Add ${provider.display_name}`}
      description="A connector record will be created in 'disconnected' state. You can authorize it on the next screen."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !name.trim()}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Display name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="e.g. Acme Jira (Production)"
        />
        {requiredFields.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Configuration</p>
            <div className="space-y-3">
              {requiredFields.map((key) => (
                <Input
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={config[key] ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateConfig(key, e.target.value)
                  }
                  placeholder={hintFor(key)}
                />
              ))}
            </div>
          </div>
        )}
        {create.isError && (
          <div className="rounded-md border border-critical/30 bg-critical/10 p-3 text-sm text-critical">
            {(create.error as Error).message}
          </div>
        )}
      </div>
    </Modal>
  );
}

function hintFor(key: string): string {
  const hints: Record<string, string> = {
    project_key: 'e.g. OPS',
    site_url: 'https://your-domain.atlassian.net',
    auth_type: 'e.g. basic or oauth2',
    instance_url: 'https://acme.service-now.com',
    incident_table: 'incident',
    sandbox: 'true / false',
    pipeline_id: 'Numeric pipeline id from HubSpot',
    region: 'us | eu | in | au | cn | jp',
    module: 'desk | crm',
  };
  return hints[key] ?? '';
}

export default Connectors;
