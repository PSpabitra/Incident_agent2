/**
 * Domain types that mirror the backend Pydantic models.
 * Keep in sync with `backend/app/schemas/*`.
 */

// ===== Auth =====
export type UserRole = 'admin' | 'engineer' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ===== Incidents =====
export type IncidentStatus =
  | 'new'
  | 'analyzing'
  | 'remediating'
  | 'resolved'
  | 'escalated'
  | 'closed';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Source = 'itsm' | 'monitoring' | 'user_chat' | 'email' | 'webhook';

export interface AgentStep {
  id: string;
  agent: string;
  action: string;
  output: string;
  timestamp: string;
  type: 'observe' | 'reason' | 'plan' | 'act' | 'evaluate';
  metadata?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  subject: string;
  description: string;
  caller: string;
  callerEmail?: string;
  source: Source;
  status: IncidentStatus;
  priority: Priority;
  severity: Severity;
  category: string;
  subcategory?: string;
  assignedTo?: string;
  slaDeadline?: string;
  slaBreached: boolean;
  autoResolved: boolean;
  confidence: number;
  steps: AgentStep[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IncidentCreatePayload {
  subject: string;
  description: string;
  caller: string;
  callerEmail?: string;
  source?: Source;
  category?: string;
  priority?: Priority;
}

// ===== Runbooks =====
export interface Runbook {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: RunbookStep[];
  triggers: string[];
  lastUpdated: string;
  successRate: number;
  executionCount: number;
  averageDurationSeconds: number;
  isActive: boolean;
  createdBy: string;
}

export interface RunbookStep {
  order: number;
  title: string;
  command?: string;
  expectedOutput?: string;
  rollback?: string;
}

// ===== Knowledge Base =====
export interface KBArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  category: string;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== Escalations =====
export interface Escalation {
  id: string;
  incidentId: string;
  reason: string;
  diagnostic: string;
  attemptedActions: string[];
  assignedEngineer?: string;
  priority: Priority;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

// ===== Dashboard =====
export interface DashboardMetric {
  label: string;
  value: number | string;
  trend: number;
  suffix?: string;
  format?: 'number' | 'percent' | 'duration' | 'currency';
}

export interface DashboardMetrics {
  mttr: DashboardMetric;
  slaCompliance: DashboardMetric;
  deflectionRate: DashboardMetric;
  totalIncidents: DashboardMetric;
  openIncidents: DashboardMetric;
  escalationRate: DashboardMetric;
}

export interface TimeseriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

// ===== Audit =====
export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  targetType: 'incident' | 'runbook' | 'kb' | 'escalation' | 'user';
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ===== Notifications =====
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}
