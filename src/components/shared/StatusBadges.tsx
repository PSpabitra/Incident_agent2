import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { Priority, IncidentStatus } from '@/types';

const priorityMap: Record<Priority, { label: string; variant: BadgeVariant }> = {
  P1: { label: 'P1 — Critical', variant: 'critical' },
  P2: { label: 'P2 — High', variant: 'high' },
  P3: { label: 'P3 — Medium', variant: 'warning' },
  P4: { label: 'P4 — Low', variant: 'muted' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityMap[priority];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

const statusMap: Record<IncidentStatus, { label: string; variant: BadgeVariant }> = {
  new: { label: 'New', variant: 'info' },
  analyzing: { label: 'Analyzing', variant: 'default' },
  remediating: { label: 'Remediating', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  escalated: { label: 'Escalated', variant: 'critical' },
  closed: { label: 'Closed', variant: 'muted' },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const config = statusMap[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
