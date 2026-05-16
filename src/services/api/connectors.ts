/**
 * Typed API wrappers for connector endpoints.
 *
 * Backed by the same axios `client` from services/api/client.ts that the rest
 * of the app uses (single-flight refresh, JWT, error envelope unwrap).
 */
import { apiClient } from "./client";

// ---------------------------------------------------------------- Types ----
export type ConnectorMaturity = "production" | "scaffold";
export type ConnectorStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "expired";

export interface ConnectorProvider {
  provider: string;
  display_name: string;
  description: string;
  auth_type: string;
  docs_url: string;
  icon: string;
  capabilities: string[];
  required_config: string[];
  maturity: ConnectorMaturity;
}

export interface Connector {
  id: string;
  provider: string;
  name: string;
  status: ConnectorStatus;
  config: Record<string, unknown>;
  last_synced_at: string | null;
  last_error: string | null;
  sync_enabled: boolean;
  poll_interval_sec: number;
  has_webhook_secret: boolean;
  webhook_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateConnectorPayload {
  provider: string;
  name: string;
  config?: Record<string, unknown>;
  sync_enabled?: boolean;
  poll_interval_sec?: number;
}

export interface UpdateConnectorPayload {
  name?: string;
  config?: Record<string, unknown>;
  sync_enabled?: boolean;
  poll_interval_sec?: number;
}

export interface OAuthStartResponse {
  authorize_url: string;
  state: string;
}

export interface ConnectorHealth {
  ok: boolean;
  latency_ms?: number;
  error?: string;
  info?: Record<string, unknown>;
}

export interface FieldMapping {
  local_field: string;
  remote_field: string;
  direction: "inbound" | "outbound" | "both";
  transform: Record<string, unknown>;
  is_required: boolean;
}

export interface WebhookEvent {
  id: string;
  external_event_id: string | null;
  event_type: string;
  signature_valid: boolean;
  received_at: string;
  processed_at: string | null;
  process_status: string;
  error: string | null;
}

// ------------------------------------------------------------ API methods --
export const ConnectorsApi = {
  listProviders: () =>
    apiClient.get<ConnectorProvider[]>("/connectors/providers").then((r) => r.data),

  list: (params?: { provider?: string; status?: string }) =>
    apiClient.get<Connector[]>("/connectors", { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Connector>(`/connectors/${id}`).then((r) => r.data),

  create: (payload: CreateConnectorPayload) =>
    apiClient.post<Connector>("/connectors", payload).then((r) => r.data),

  update: (id: string, patch: UpdateConnectorPayload) =>
    apiClient.patch<Connector>(`/connectors/${id}`, patch).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete<void>(`/connectors/${id}`).then((r) => r.data),

  startOAuth: (id: string) =>
    apiClient.post<OAuthStartResponse>(`/connectors/${id}/connect`).then((r) => r.data),

  connectBasic: (id: string, payload: Record<string, string>) =>
    apiClient.post<{ ok: boolean; error?: string }>(`/connectors/${id}/connect-basic`, payload).then((r) => r.data),

  health: (id: string) =>
    apiClient.get<ConnectorHealth>(`/connectors/${id}/health`).then((r) => r.data),

  syncNow: (id: string, since?: string) =>
    apiClient
      .post<{ ok: boolean; fetched?: number; applied?: number; errors?: string[]; error?: string }>(
        `/connectors/${id}/sync`,
        null,
        { params: since ? { since } : undefined },
      )
      .then((r) => r.data),

  registerWebhook: (id: string) =>
    apiClient.post<Record<string, unknown>>(`/connectors/${id}/register-webhook`).then((r) => r.data),

  listEvents: (id: string, limit = 50) =>
    apiClient.get<WebhookEvent[]>(`/connectors/${id}/events`, { params: { limit } }).then((r) => r.data),

  listMappings: (id: string) =>
    apiClient.get<FieldMapping[]>(`/connectors/${id}/mappings`).then((r) => r.data),

  replaceMappings: (id: string, mappings: FieldMapping[]) =>
    apiClient
      .put<FieldMapping[]>(`/connectors/${id}/mappings`, { mappings })
      .then((r) => r.data),
};
