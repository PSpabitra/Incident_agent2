import { apiClient } from './client';
import { apiConfig } from '@/config/api.config';
import type {
  ApiResponse,
  PaginatedResponse,
  IncidentFilterParams,
  Incident,
  IncidentCreatePayload,
  Runbook,
  KBArticle,
  Escalation,
  DashboardMetrics,
  TimeseriesPoint,
  AuditLogEntry,
  User,
  AgentStep,
} from '@/types';

/** Auth ===================================================================== */
export const authApi = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<
      ApiResponse<{ user: User; access_token: string; refresh_token: string }>
    >(apiConfig.endpoints.auth.login, { email, password });
    return data.data;
  },
  async logout() {
    await apiClient.post(apiConfig.endpoints.auth.logout);
  },
  async me() {
    const { data } = await apiClient.get<ApiResponse<User>>(apiConfig.endpoints.auth.me);
    return data.data;
  },
};

/** Incidents ================================================================ */
export const incidentApi = {
  async list(params: IncidentFilterParams = {}) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Incident>>>(
      apiConfig.endpoints.incidents.list,
      { params },
    );
    return data.data;
  },
  async detail(id: string) {
    const { data } = await apiClient.get<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.detail(id),
    );
    return data.data;
  },
  async create(payload: IncidentCreatePayload) {
    const { data } = await apiClient.post<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.create,
      payload,
    );
    return data.data;
  },
  async ingest(payload: IncidentCreatePayload) {
    const { data } = await apiClient.post<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.ingest,
      payload,
    );
    return data.data;
  },
  async triage(id: string) {
    const { data } = await apiClient.post<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.triage(id),
    );
    return data.data;
  },
  async resolve(id: string, notes?: string) {
    const { data } = await apiClient.post<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.resolve(id),
      { notes },
    );
    return data.data;
  },
  async escalate(id: string, reason: string) {
    const { data } = await apiClient.post<ApiResponse<Incident>>(
      apiConfig.endpoints.incidents.escalate(id),
      { reason },
    );
    return data.data;
  },
  async timeline(id: string) {
    const { data } = await apiClient.get<ApiResponse<AgentStep[]>>(
      apiConfig.endpoints.incidents.timeline(id),
    );
    return data.data;
  },
};

/** Runbooks ================================================================= */
export const runbookApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<Runbook[]>>(apiConfig.endpoints.runbooks.list);
    return data.data;
  },
  async detail(id: string | number) {
    const { data } = await apiClient.get<ApiResponse<Runbook>>(
      apiConfig.endpoints.runbooks.detail(id.toString()),
    );
    return data.data;
  },
  async execute(id: string | number, incidentId: string) {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; output: string }>>(
      apiConfig.endpoints.runbooks.execute(id.toString()),
      { incident_id: incidentId },
    );
    return data.data;
  },
  async executions(id: string | number, limit = 20) {
    const { data } = await apiClient.get<
      ApiResponse<
        Array<{
          incident_id: string;
          subject: string;
          status: string;
          priority: string;
          category: string;
          executed_at: string;
          duration_s: number;
          success: boolean;
          auto_resolved: boolean;
          resolved_at: string | null;
          steps: Array<{
            id: string;
            agent: string;
            action: string;
            output: string;
            type: string;
            metadata: Record<string, unknown>;
            timestamp: string;
          }>;
        }>
      >
    >(`/runbooks/${id}/executions`, { params: { limit } });
    return data.data;
  },
  async upload(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await apiClient.post<ApiResponse<Runbook>>(
      apiConfig.endpoints.runbooks.upload,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.data;
  },
};

/** Knowledge Base =========================================================== */
export const kbApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<KBArticle[]>>(
      apiConfig.endpoints.knowledgeBase.list,
    );
    return data.data;
  },
  async search(query: string) {
    const { data } = await apiClient.get<ApiResponse<KBArticle[]>>(
      apiConfig.endpoints.knowledgeBase.search,
      { params: { q: query } },
    );
    return data.data;
  },
  async detail(id: string | number) {
    const { data } = await apiClient.get<ApiResponse<KBArticle>>(
      apiConfig.endpoints.knowledgeBase.detail(id.toString()),
    );
    return data.data;
  },
  async upload(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await apiClient.post<ApiResponse<KBArticle>>(
      apiConfig.endpoints.knowledgeBase.upload,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.data;
  },
};

/** Escalations ============================================================== */
export const escalationApi = {
  async list() {
    const { data } = await apiClient.get<ApiResponse<Escalation[]>>(
      apiConfig.endpoints.escalations.list,
    );
    return data.data;
  },
  async assign(id: string, engineerId: string) {
    const { data } = await apiClient.post<ApiResponse<Escalation>>(
      apiConfig.endpoints.escalations.assign(id),
      { engineer_id: engineerId },
    );
    return data.data;
  },
  async resolve(id: string, notes: string) {
    const { data } = await apiClient.post<ApiResponse<Escalation>>(
      apiConfig.endpoints.escalations.resolve(id),
      { notes },
    );
    return data.data;
  },
};

/** Dashboard ================================================================ */
export const dashboardApi = {
  async metrics() {
    const { data } = await apiClient.get<ApiResponse<DashboardMetrics>>(
      apiConfig.endpoints.dashboard.metrics,
    );
    return data.data;
  },
  async timeseries(metric: string, range = '7d') {
    const { data } = await apiClient.get<ApiResponse<TimeseriesPoint[]>>(
      apiConfig.endpoints.dashboard.timeseries,
      { params: { metric, range } },
    );
    return data.data;
  },
};

/** Audit / Actions ========================================================== */
export const auditApi = {
  async list(limit = 50) {
    const { data } = await apiClient.get<ApiResponse<AuditLogEntry[]>>(
      apiConfig.endpoints.actions.list,
      { params: { limit } },
    );
    return data.data;
  },
};
