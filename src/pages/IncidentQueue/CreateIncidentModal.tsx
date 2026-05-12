import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { incidentApi } from '@/services/api/endpoints';
import { incidentCreateSchema, type IncidentCreateInput } from '@/utils/validators';

interface CreateIncidentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateIncidentModal({ open, onClose, onCreated }: CreateIncidentModalProps) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IncidentCreateInput>({
    resolver: zodResolver(incidentCreateSchema),
    defaultValues: { source: 'user_chat', priority: 'P3' },
  });

  const onSubmit = async (data: IncidentCreateInput) => {
    setSubmitting(true);
    try {
      const created = await incidentApi.ingest(data);
      success('Incident created', `${created.id} dispatched to triage agent`);
      reset();
      onCreated();
    } catch (err) {
      error(
        'Failed to create incident',
        err instanceof Error ? err.message : 'Please try again',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ingest New Incident"
      description="The agent will classify, prioritise, and attempt automated remediation."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={submitting}>
            Submit to Agent
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input
          label="Subject"
          placeholder="Cannot connect to production database"
          error={errors.subject?.message}
          {...register('subject')}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={5}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Describe the issue, error messages, what you've tried..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-critical">{errors.description.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Caller name"
            placeholder="Jane Doe"
            error={errors.caller?.message}
            {...register('caller')}
          />
          <Input
            label="Caller email"
            type="email"
            placeholder="jane@company.com"
            error={errors.callerEmail?.message}
            {...register('callerEmail')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Source"
            options={[
              { value: 'user_chat', label: 'User chat' },
              { value: 'itsm', label: 'ITSM (ServiceNow / Jira)' },
              { value: 'monitoring', label: 'Monitoring alert' },
              { value: 'email', label: 'Email' },
              { value: 'webhook', label: 'Webhook' },
            ]}
            {...register('source')}
          />
          <Select
            label="Initial priority"
            options={[
              { value: 'P1', label: 'P1 — Critical' },
              { value: 'P2', label: 'P2 — High' },
              { value: 'P3', label: 'P3 — Medium' },
              { value: 'P4', label: 'P4 — Low' },
            ]}
            {...register('priority')}
          />
        </div>
      </form>
    </Modal>
  );
}
