/**
 * Field Mappings editor.
 *
 * Lets admins define per-connector translation rules:
 *   local_field   ↔   remote_field   [direction]   {value_map}
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useToast } from '@/hooks/useToast';
import { ConnectorsApi, type FieldMapping } from '@/services/api/connectors';

const DIRECTION_OPTIONS = [
  { label: 'Both', value: 'both' },
  { label: 'Inbound', value: 'inbound' },
  { label: 'Outbound', value: 'outbound' },
];

export function FieldMappings() {
  const { id = '' } = useParams<{ id: string }>();
  const toast = useToast();
  const qc = useQueryClient();

  const mappingsQ = useQuery({
    queryKey: ['connector-mappings', id],
    queryFn: () => ConnectorsApi.listMappings(id),
    enabled: !!id,
  });

  const [rows, setRows] = useState<FieldMapping[]>([]);
  // Track raw transform JSON text per row, so users can type freely without
  // their input being clobbered when JSON is mid-edit and unparseable.
  const [transformText, setTransformText] = useState<string[]>([]);
  const [transformErrors, setTransformErrors] = useState<(string | null)[]>([]);

  useEffect(() => {
    if (mappingsQ.data) {
      setRows(mappingsQ.data);
      setTransformText(mappingsQ.data.map((m) => JSON.stringify(m.transform ?? {})));
      setTransformErrors(mappingsQ.data.map(() => null));
    }
  }, [mappingsQ.data]);

  const save = useMutation({
    mutationFn: () => ConnectorsApi.replaceMappings(id, rows),
    onSuccess: async (data) => {
      setRows(data);
      setTransformText(data.map((m) => JSON.stringify(m.transform ?? {})));
      setTransformErrors(data.map(() => null));
      await qc.invalidateQueries({ queryKey: ['connector-mappings', id] });
      toast.success('Mappings saved');
    },
    onError: (e: Error) => toast.error('Failed to save', e.message),
  });

  const updateRow = (i: number, patch: Partial<FieldMapping>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const updateTransform = (i: number, raw: string) => {
    setTransformText((prev) => prev.map((t, idx) => (idx === i ? raw : t)));
    try {
      const parsed = JSON.parse(raw || '{}');
      updateRow(i, { transform: parsed });
      setTransformErrors((prev) => prev.map((e, idx) => (idx === i ? null : e)));
    } catch {
      setTransformErrors((prev) => prev.map((e, idx) => (idx === i ? 'Invalid JSON' : e)));
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        local_field: '',
        remote_field: '',
        direction: 'both',
        transform: {},
        is_required: false,
      },
    ]);
    setTransformText((prev) => [...prev, '{}']);
    setTransformErrors((prev) => [...prev, null]);
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setTransformText((prev) => prev.filter((_, idx) => idx !== i));
    setTransformErrors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const hasErrors = transformErrors.some((e) => e !== null);

  if (mappingsQ.isLoading) {
    return (
      <PageWrapper title="Loading…">
        <PageSpinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Field mappings"
      description="Define how local incident fields translate to provider fields."
    >
      <Link
        to={`/connectors/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to connector
      </Link>

      <Card className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Defaults for the provider are always applied. Mappings here override or extend those
          defaults. The <code>transform</code> field accepts a value-map object like{' '}
          <code className="rounded bg-muted px-1 py-0.5">
            {`{"value_map": {"P1": "Highest"}}`}
          </code>
          .
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-3">Local field</th>
                <th className="pb-2 pr-3">Remote path</th>
                <th className="pb-2 pr-3">Direction</th>
                <th className="pb-2 pr-3">Transform (JSON)</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-3 align-top">
                    <Input
                      value={row.local_field}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateRow(i, { local_field: e.target.value })
                      }
                      placeholder="priority"
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Input
                      value={row.remote_field}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateRow(i, { remote_field: e.target.value })
                      }
                      placeholder="fields.priority.name"
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Select
                      options={DIRECTION_OPTIONS}
                      value={row.direction}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateRow(i, {
                          direction: e.target.value as FieldMapping['direction'],
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Input
                      value={transformText[i] ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateTransform(i, e.target.value)
                      }
                      placeholder='{"value_map":{"P1":"Highest"}}'
                      error={transformErrors[i] ?? undefined}
                      className="font-mono text-xs"
                    />
                  </td>
                  <td className="py-2 text-right align-top">
                    <button
                      onClick={() => removeRow(i)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-critical"
                      aria-label="Remove row"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No custom mappings. Default field mappings will be used.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addRow}>
            Add mapping
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || hasErrors}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save mappings
          </Button>
        </div>
      </Card>
    </PageWrapper>
  );
}

export default FieldMappings;
