/**
 * Connector detail page — config view, OAuth connect, health check,
 * webhook registration, recent events, field-mappings link, danger zone.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  PlayCircle,
  Plug,
  RefreshCw,
  Settings as SettingsIcon,
  Trash2,
  Webhook,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useToast } from '@/hooks/useToast';
import { ConnectorsApi } from '@/services/api/connectors';
import { formatRelativeTime } from '@/utils/formatters';

export function ConnectorDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const qc = useQueryClient();

  const connectorQ = useQuery({
    queryKey: ['connector', id],
    queryFn: () => ConnectorsApi.get(id),
    enabled: !!id,
  });

  // Show success toast if backend redirected here after OAuth
  useEffect(() => {
    if (params.get('connected') === '1') {
      toast.success('Connector authorized', 'Credentials saved and ready for sync.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const connector = connectorQ.data;
  const [basicAuthOpen, setBasicAuthOpen] = useState(false);
  const [basicAuthForm, setBasicAuthForm] = useState({ 
    username: '', 
    password: '', 
    security_token: '',
    client_id: '',
    client_secret: '',
    refresh_token: ''
  });
  const [editingConfig, setEditingConfig] = useState(false);
  const [draftConfig, setDraftConfig] = useState('');

  const updateConfig = useMutation({
    mutationFn: () => {
      try {
        const parsed = JSON.parse(draftConfig);
        return ConnectorsApi.update(id, { config: parsed });
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['connector', id] });
      setEditingConfig(false);
      toast.success('Configuration updated');
    },
    onError: (e: Error) => toast.error('Update failed', e.message),
  });

  const startOAuth = useMutation({
    mutationFn: () => ConnectorsApi.startOAuth(id),
    onSuccess: (res) => {
      window.location.href = res.authorize_url;
    },
    onError: (e: Error) => toast.error('Failed to start OAuth', e.message),
  });

  const connectBasic = useMutation({
    mutationFn: () => ConnectorsApi.connectBasic(id, basicAuthForm),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['connector', id] });
      if (res.ok) {
        toast.success('Connected successfully');
        setBasicAuthOpen(false);
      } else {
        toast.error('Connection failed', res.error ?? 'Unknown error');
      }
    },
  });

  const checkHealth = useMutation({
    mutationFn: () => ConnectorsApi.health(id),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['connector', id] });
      if (res.ok) {
        toast.success('Health OK', `${res.latency_ms ?? '?'}ms`);
      } else {
        toast.error('Health check failed', res.error ?? 'Unknown error');
      }
    },
  });

  const syncNow = useMutation({
    mutationFn: () => ConnectorsApi.syncNow(id),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['connector', id] });
      if (res.ok) {
        toast.success('Sync complete', `${res.applied ?? 0}/${res.fetched ?? 0} records`);
      } else {
        toast.error('Sync failed', res.error ?? 'Unknown error');
      }
    },
  });

  const registerWebhook = useMutation({
    mutationFn: () => ConnectorsApi.registerWebhook(id),
    onSuccess: () => toast.success('Webhook registered', 'Provider will now POST events to us.'),
    onError: (e: Error) => toast.error('Webhook registration failed', e.message),
  });

  const remove = useMutation({
    mutationFn: () => ConnectorsApi.remove(id),
    onSuccess: () => {
      toast.success('Connector deleted');
      navigate('/connectors');
    },
  });

  if (connectorQ.isLoading) {
    return (
      <PageWrapper title="Loading…">
        <PageSpinner />
      </PageWrapper>
    );
  }
  if (!connector) {
    return (
      <PageWrapper title="Not found">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">This connector doesn't exist.</p>
          <Button className="mt-3" onClick={() => navigate('/connectors')}>
            Back to connectors
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={connector.name} description={`${connector.provider} connector`}>
      <Link
        to="/connectors"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All connectors
      </Link>

      {/* ----- Status row ------------------------------------------- */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge
              variant={
                connector.status === 'connected'
                  ? 'success'
                  : connector.status === 'error' || connector.status === 'expired'
                  ? 'critical'
                  : 'muted'
              }
            >
              {connector.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {connector.last_synced_at
                ? `Last sync ${formatRelativeTime(connector.last_synced_at)}`
                : 'Never synced'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connector.status !== 'connected' ? (
              <Button
                onClick={() => {
                  if (connector.provider === 'servicenow' || connector.provider === 'zoho' || connector.provider === 'salesforce') {
                    // For now, let's assume if it's basic auth we show the form
                    // Actually, we check metadata or auth_type.
                    // But our Connector type doesn't have auth_type yet in the frontend.
                    // Wait, let's check provider catalog or just look at the connector object if I added it.
                    // Actually, I'll just check if it's servicenow for now as per user request.
                    setBasicAuthOpen(true);
                  } else {
                    startOAuth.mutate();
                  }
                }}
                disabled={startOAuth.isPending || connectBasic.isPending}
                leftIcon={
                  startOAuth.isPending || connectBasic.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="h-4 w-4" />
                  )
                }
              >
                Connect
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  if (connector.provider === 'servicenow') {
                    setBasicAuthOpen(true);
                  } else {
                    startOAuth.mutate();
                  }
                }}
                disabled={startOAuth.isPending || connectBasic.isPending}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reconnect
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => checkHealth.mutate()}
              disabled={checkHealth.isPending}
              leftIcon={<Activity className="h-4 w-4" />}
            >
              Health check
            </Button>
            <Button
              variant="ghost"
              onClick={() => syncNow.mutate()}
              disabled={syncNow.isPending || connector.status !== 'connected'}
              leftIcon={<PlayCircle className="h-4 w-4" />}
            >
              Sync now
            </Button>
          </div>
        </div>
        {connector.last_error && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-critical/30 bg-critical/5 p-3 text-sm text-critical">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {connector.last_error}
            </pre>
          </div>
        )}

        {basicAuthOpen && (
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Enter Credentials</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(connector.provider === 'servicenow' || connector.provider === 'salesforce') && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Username</label>
                    <input
                      type="text"
                      className="w-full rounded border bg-background p-2 text-sm"
                      value={basicAuthForm.username}
                      onChange={(e) => setBasicAuthForm({ ...basicAuthForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Password</label>
                    <input
                      type="password"
                      className="w-full rounded border bg-background p-2 text-sm"
                      value={basicAuthForm.password}
                      onChange={(e) => setBasicAuthForm({ ...basicAuthForm, password: e.target.value })}
                    />
                  </div>
                </>
              )}
              {connector.provider === 'salesforce' && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-muted-foreground">Security Token</label>
                  <input
                    type="password"
                    className="w-full rounded border bg-background p-2 text-sm"
                    value={basicAuthForm.security_token}
                    onChange={(e) => setBasicAuthForm({ ...basicAuthForm, security_token: e.target.value })}
                    placeholder="Enter Salesforce Security Token"
                  />
                </div>
              )}
              {connector.provider === 'zoho' && (
                <>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Client ID</label>
                    <input
                      className="w-full rounded border bg-background p-2 text-sm"
                      value={basicAuthForm.client_id}
                      onChange={(e) => setBasicAuthForm({ ...basicAuthForm, client_id: e.target.value })}
                      placeholder="Enter Zoho Client ID"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Client Secret</label>
                    <input
                      type="password"
                      className="w-full rounded border bg-background p-2 text-sm"
                      value={basicAuthForm.client_secret}
                      onChange={(e) => setBasicAuthForm({ ...basicAuthForm, client_secret: e.target.value })}
                      placeholder="Enter Zoho Client Secret"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Refresh Token</label>
                    <input
                      type="password"
                      className="w-full rounded border bg-background p-2 text-sm"
                      value={basicAuthForm.refresh_token}
                      onChange={(e) => setBasicAuthForm({ ...basicAuthForm, refresh_token: e.target.value })}
                      placeholder="Enter Zoho Refresh Token"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => connectBasic.mutate()} disabled={connectBasic.isPending}>
                Verify & Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setBasicAuthOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ----- Configuration --------------------------------------- */}
      <Card className="mb-6 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 font-medium">
            <SettingsIcon className="h-4 w-4" /> Configuration
          </h3>
          {!editingConfig ? (
            <Button size="sm" variant="ghost" onClick={() => {
              setEditingConfig(true);
              setDraftConfig(JSON.stringify(connector.config, null, 2));
            }}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateConfig.mutate()} disabled={updateConfig.isPending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingConfig(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {editingConfig ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-1">JSON Configuration</p>
            <textarea
              className="w-full h-32 rounded border bg-background p-2 font-mono text-xs"
              value={draftConfig}
              onChange={(e) => setDraftConfig(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {Object.entries(connector.config ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <span className="w-32 text-muted-foreground">{k}</span>
                <span className="break-all">{String(v)}</span>
              </div>
            ))}
            {Object.keys(connector.config ?? {}).length === 0 && (
              <span className="text-muted-foreground">No configuration values set yet.</span>
            )}
          </div>
        )}
      </Card>

      {/* ----- Webhook --------------------------------------------- */}
      <Card className="mb-6 p-4">
        <h3 className="mb-3 inline-flex items-center gap-2 font-medium">
          <Webhook className="h-4 w-4" /> Webhook
        </h3>
        {connector.has_webhook_secret ? (
          <>
            <p className="mb-2 text-sm text-muted-foreground">
              The provider should POST to this URL. The token in the query string authenticates the
              call.
            </p>
            <div className="flex items-center gap-2 rounded-md bg-muted p-3 font-mono text-xs">
              <span className="flex-1 break-all">{connector.webhook_url}</span>
              <CopyBtn value={connector.webhook_url ?? ''} />
            </div>
            <Button
              className="mt-3"
              size="sm"
              variant="secondary"
              onClick={() => registerWebhook.mutate()}
              disabled={registerWebhook.isPending || connector.status !== 'connected'}
            >
              Register with {connector.provider}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            This provider does not support webhooks.
          </p>
        )}
      </Card>

      {/* ----- Mappings & events links ---------------------------- */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-1 font-medium">Field mappings</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Customize how local fields map to provider fields.
          </p>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/connectors/${id}/mappings`)}>
            Edit mappings →
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="mb-1 font-medium">Recent events</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Webhook & sync log for this connector.
          </p>
          <RecentEventsButton id={id} />
        </Card>
      </div>

      {/* ----- Danger zone ---------------------------------------- */}
      <Card className="border-critical/30 p-4">
        <h3 className="mb-2 inline-flex items-center gap-2 font-medium text-critical">
          <Trash2 className="h-4 w-4" /> Danger zone
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Deleting this connector revokes credentials and removes the link to all synced records.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (window.confirm(`Delete connector "${connector.name}"?`)) remove.mutate();
          }}
          disabled={remove.isPending}
        >
          Delete connector
        </Button>
      </Card>
    </PageWrapper>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="rounded p-1.5 hover:bg-surface-hover"
      aria-label="Copy URL"
      type="button"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function RecentEventsButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const eventsQ = useQuery({
    queryKey: ['connector-events', id],
    queryFn: () => ConnectorsApi.listEvents(id, 25),
    enabled: open,
  });
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide events' : 'Show events'}
      </Button>
      {open && (
        <div className="mt-3">
          {eventsQ.isLoading ? (
            <Spinner size="sm" label="Loading…" />
          ) : (eventsQ.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {eventsQ.data!.map((ev) => (
                <li key={ev.id} className="flex flex-wrap items-baseline gap-2">
                  <Badge
                    variant={
                      ev.process_status === 'processed'
                        ? 'success'
                        : ev.process_status === 'failed'
                        ? 'critical'
                        : 'muted'
                    }
                  >
                    {ev.process_status}
                  </Badge>
                  <span className="font-mono">{ev.event_type}</span>
                  <span className="text-muted-foreground">
                    {formatRelativeTime(ev.received_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

export default ConnectorDetail;
