import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Layers,
  History,
  XCircle,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { CreateContentModal } from '@/components/shared/CreateContentModal';
import { Sheet } from '@/components/ui/Sheet';
import { FileText, Download, Archive, Edit3 } from 'lucide-react';
import { runbookApi } from '@/services/api/endpoints';
import { formatDuration, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import type { Runbook } from '@/types';
import { ManualRichSummary } from '../../components/shared/ManualRichSummary';
import { useToast } from '@/hooks/useToast';

type FilterTab = 'ALL' | 'ACTIVE' | 'PROCESSING' | 'FAILED' | 'ARCHIVED';
type DetailTab = 'steps' ;

export default function Runbooks() {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Runbook' | 'Article'>('Runbook');
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('steps');
  const [processedRunbook, setProcessedRunbook] = useState<Runbook | null>(null);
  const { success, error } = useToast();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Runbook[]>({
    queryKey: ['runbooks'],
    queryFn: () => runbookApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => runbookApi.upload(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runbooks'] });
      setIsModalOpen(false);
      setProcessedRunbook(null);
      success('Upload Successful', 'Runbook uploaded and indexed successfully.');
    },
  });

  const handleCreate = async (formData: { files: File[] }) => {
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const invalidFiles = formData.files.filter(file => 
      !ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE
    );

    if (invalidFiles.length > 0) {
      error(
        'Invalid Files',
        'Only PDF and DOCX files are allowed, and must be under 20MB.'
      );
      return;
    }

    if (formData.files.length > 0) {
      uploadMutation.mutate(formData.files);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) => runbookApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runbooks'] });
      setIsModalOpen(false);
      setProcessedRunbook(null);
    },
  });

  const [archivedIds, setArchivedIds] = useState<Set<string | number>>(() => {
    const saved = localStorage.getItem('archived_runbooks');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  const handleArchive = (id: string | number) => {
    const next = new Set(archivedIds);
    next.add(id);
    setArchivedIds(next);
    localStorage.setItem('archived_runbooks', JSON.stringify(Array.from(next)));
    setSelectedRunbook(null);
    success('Runbook Archived', 'The runbook has been moved to archive locally.');
  };

  const handleDownloadTxt = (rb: Runbook) => {
    const name = typeof rb.name === 'object' ? 'Runbook' : (rb.summary?.name || rb.name || 'Runbook');
    const content = `
RUNBOOK: ${name}
CATEGORY: ${rb.summary?.category || rb.category || 'General'}
UPDATED: ${rb.updatedAt || rb.lastUpdated || rb.createdAt || new Date().toISOString()}
--------------------------------------------------
DESCRIPTION:
${renderDescription(rb)}

STEPS:
${(rb.steps || rb.execution_steps || []).map((s: any, i: number) => `${i + 1}. ${s.title}${s.command ? `\n   Command: ${s.command}` : ''}`).join('\n\n')}
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Guide downloaded in TXT format');
  };

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((rb) => {
        const nameRaw = typeof rb.name === 'object' ? (rb.summary?.name || '') : (rb.name || '');
        const name = typeof nameRaw === 'string' ? nameRaw : '';
        
        const summaryNameRaw = rb.summary?.name || '';
        const summaryName = typeof summaryNameRaw === 'string' ? summaryNameRaw : '';
        
        const categoryRaw = rb.summary?.category || (typeof rb.category === 'string' ? rb.category : '');
        const category = typeof categoryRaw === 'string' ? categoryRaw : '';
        
        const descRaw = typeof rb.description === 'object' ? (rb.summary?.description || '') : (rb.description || '');
        const desc = typeof descRaw === 'string' ? descRaw : '';
        
        const summaryDescRaw = rb.summary?.description || rb.summary?.summary || '';
        const summaryDesc = typeof summaryDescRaw === 'string' ? summaryDescRaw : '';

        return (
          name.toLowerCase().includes(s) ||
          summaryName.toLowerCase().includes(s) ||
          category.toLowerCase().includes(s) ||
          desc.toLowerCase().includes(s) ||
          summaryDesc.toLowerCase().includes(s)
        );
      });
    }
    if (filterTab === 'ALL') {
      // Show everything except archived (local or backend)
      list = list.filter((rb) => !archivedIds.has(rb.id) && rb.status !== 'archived');
    } else if (filterTab === 'ARCHIVED') {
      list = list.filter((rb) => archivedIds.has(rb.id) || rb.status === 'archived');
    } else {
      const statusMap: Record<FilterTab, string> = {
        ALL: '',
        ACTIVE: 'active',
        PROCESSING: 'processing',
        FAILED: 'failed',
        ARCHIVED: 'archived',
      };
      // For specific status tabs, also exclude local archives
      list = list.filter((rb) => (rb.status === statusMap[filterTab] || (filterTab === 'ACTIVE' && rb.isActive)) && !archivedIds.has(rb.id));
    }
    return list;
  }, [data, search, filterTab, archivedIds]);

  const stats = [
    {
      label: 'TOTAL RUNBOOKS',
      value: data?.length || 0,
      sub: 'tracked operational SOPs',
      icon: BookOpen,
      color: 'text-indigo-500',
    },
    {
      label: 'ACTIVE',
      value: data?.filter((r) => r.isActive).length || 0,
      sub: 'indexed in vector DB',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      label: 'PROCESSING',
      value: 0,
      sub: 'being chunked & embedded',
      icon: RefreshCw,
      color: 'text-amber-500',
    },
    {
      label: 'INDEXED CHUNKS',
      value: (data?.length || 0) * 35,
      sub: 'vectors in Chroma',
      icon: Layers,
      color: 'text-cyan-500',
    },
  ];

  const renderDescription = (rb: Runbook) => {
    const desc = rb.summary?.description || rb.summary?.summary || rb.description;
    if (typeof desc === 'object' && desc !== null) {
      return (desc as any).description || (desc as any).summary || (desc as any).overview || 'No description available.';
    }
    return desc || 'No description available.';
  };

  if (isLoading) return <PageSpinner />;

  return (
    <PageWrapper bare>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 text-slate-900">
              <BookOpen className="h-7 w-7 text-slate-800" /> Runbooks
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Upload PDF/DOCX runbooks · stored locally · indexed into the RAG vector store
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 text-slate-600 font-bold text-[11px] tracking-widest h-10 px-4"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['runbooks'] })}
            >
              REFRESH
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-[11px] tracking-widest h-10 px-5 shadow-lg shadow-blue-100"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setModalType('Runbook');
                setIsModalOpen(true);
              }}
            >
              UPLOAD RUNBOOK
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <Card key={s.label} className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  {s.label}
                </p>
                <div
                  className={cn(
                    'p-2 rounded-xl bg-white border border-slate-100 shadow-sm',
                    s.color,
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-4xl font-bold text-slate-900">{s.value}</h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium italic">
                  {s.sub}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter/Search Bar */}
        <Card className="p-2 border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search runbooks, tags, or descriptions..."
                className="pl-11 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 pr-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {(['ALL', 'ACTIVE', 'PROCESSING', 'FAILED', 'ARCHIVED'] as FilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={cn(
                      'px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap tracking-widest',
                      filterTab === tab
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/50',
                    )}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
          </div>
        </Card>
        {/* Table View */}
        <Card className="overflow-hidden border-slate-100 shadow-sm rounded-xl min-h-[400px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <PageSpinner />
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <Table className="border-none border-separate border-spacing-0">
                <THead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                  <TR className="hover:bg-transparent border-none">
                    <TH className="px-8 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">RUNBOOK</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">CATEGORY</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">SOURCE</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold text-center bg-slate-50 sticky top-0 z-20 border-b border-slate-100">CHUNKS</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold text-center bg-slate-50 sticky top-0 z-20 border-b border-slate-100">STATUS</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">UPDATED</TH>
                    <TH className="px-8 py-5 text-slate-400 text-[10px] tracking-widest font-bold text-right bg-slate-50 sticky top-0 z-20 border-b border-slate-100">ACTIONS</TH>
                  </TR>
                </THead>
              <TBody>
                {filtered.map((rb) => (
                  <TR key={rb.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TD className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[15px] text-slate-800">
                          {typeof rb.name === 'object' ? 'Unnamed Runbook' : (rb.summary?.name || rb.name || 'Unnamed Runbook')}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50/50 text-blue-600 border-blue-100/50 text-[9px] font-bold px-1.5 h-5 flex items-center justify-center tracking-tighter"
                        >
                          RAG
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-1 max-w-md font-medium">
                        {renderDescription(rb)}
                      </p>
                    </TD>
                    <TD className="px-6 py-6">
                      <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                        {rb.summary?.category || rb.category || 'GENERAL'}
                      </span>
                    </TD>
                    <TD className="px-6 py-6">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold text-slate-500 border-slate-200 bg-white"
                      >
                        PDF
                      </Badge>
                    </TD>
                    <TD className="px-6 py-6 text-center">
                      <span className="text-sm font-bold text-slate-700">35</span>
                    </TD>
                    <TD className="px-6 py-6 text-center">
                      <Badge
                        variant={rb.isActive ? "success" : "muted"}
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 h-6"
                      >
                        {rb.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TD>
                    <TD className="px-6 py-6 whitespace-nowrap">
                      <span className="text-[13px] text-slate-400 font-medium">
                        {formatRelativeTime(rb.updatedAt || rb.lastUpdated || rb.createdAt || new Date())}
                      </span>
                    </TD>
                    <TD className="px-8 py-6">
                      <div className="flex items-center justify-end gap-5">
                        <button 
                          onClick={() => {
                            setSelectedRunbook(rb);
                            setActiveDetailTab('steps');
                          }}
                          className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors tracking-widest"
                        >
                          VIEW
                        </button>
                        <button className="text-slate-300 hover:text-rose-500 transition-all transform hover:scale-110">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          )}
        </Card>

      </div>

      {/* Runbook Detail Side Panel */}
      <Sheet
        open={!!selectedRunbook}
        onClose={() => setSelectedRunbook(null)}
        size="lg"
        title={
          selectedRunbook && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] font-bold px-2 h-5 tracking-widest uppercase">
                    {selectedRunbook.summary?.category || selectedRunbook.category || 'GENERAL'}
                  </Badge>
                 
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {typeof selectedRunbook.name === 'object' ? 'Runbook Details' : (selectedRunbook.summary?.name || selectedRunbook.name || 'Runbook Details')}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Updated by <span className="text-slate-600 font-bold">{selectedRunbook.createdBy || 'system@agenticops.ai'}</span> · {formatRelativeTime(selectedRunbook.updatedAt || selectedRunbook.lastUpdated || new Date())}
                </p>
              </div>
            </div>
          )
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[10px] font-bold tracking-widest h-9 px-4" 
                leftIcon={<Archive className="h-3.5 w-3.5" />}
                onClick={() => selectedRunbook && handleArchive(selectedRunbook.id)}
                disabled={!!(selectedRunbook && (archivedIds.has(selectedRunbook.id) || selectedRunbook.status === 'archived'))}
              >
                {selectedRunbook && (archivedIds.has(selectedRunbook.id) || selectedRunbook.status === 'archived') ? 'ARCHIVED' : 'ARCHIVE'}
              </Button>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold tracking-widest h-10 px-6 shadow-lg shadow-blue-100" 
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => selectedRunbook && handleDownloadTxt(selectedRunbook)}
            >
              DOWNLOAD GUIDE
            </Button>
          </div>
        }
      >
        {selectedRunbook && (
          <div className="space-y-8 pb-10">
            <ManualRichSummary 
              data={
                typeof selectedRunbook.description === 'object' && selectedRunbook.description !== null
                  ? (selectedRunbook.description as any)
                  : { overview: renderDescription(selectedRunbook) }
              } 
            />

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 px-0 py-1 text-[11px] font-bold text-slate-900 tracking-widest uppercase">
                <BookOpen className="h-4 w-4 text-slate-800" />
                Execution Steps
              </div>
              <StepsTab runbook={selectedRunbook} />
            </div>
          </div>
        )}
      </Sheet>

      <CreateContentModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => {
          setIsModalOpen(false);
          setProcessedRunbook(null);
        }}
        onSubmit={handleCreate}
        onUpdate={(id, data) => updateMutation.mutate({ id, payload: data })}
        isLoading={uploadMutation.isPending}
        isUpdating={updateMutation.isPending}
        processedData={processedRunbook}
        onReset={() => {
          setProcessedRunbook(null);
        }}
      />
    </PageWrapper>
  );
}

// --- Subcomponents ---

function StepsTab({ runbook }: { runbook: Runbook }) {
  const steps = runbook.steps || runbook.execution_steps || [];
  if (steps.length === 0) return <p className="text-sm text-muted-foreground py-4">No steps defined.</p>;
  
  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.order} className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm shadow-blue-100">
            {step.order}
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">{step.title}</p>
            {step.command && (
              <pre className="mt-2 p-3 rounded bg-blue-950 text-blue-50 text-[11px] font-mono overflow-x-auto border border-blue-900/50">
                {step.command}
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function HistoryTab({ runbookId }: { runbookId: string | number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['runbook-executions', runbookId],
    queryFn: () => runbookApi.executions(runbookId, 20),
  });

  if (isLoading) return <Spinner size="md" className="py-8" />;
  if (!data || data.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No execution history found.</p>;

  return (
    <div className="space-y-3">
      {data.map((ex) => (
        <div key={ex.executed_at} className="p-4 rounded-lg border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {ex.success ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
            <div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{ex.subject}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(ex.executed_at)} · {formatDuration(ex.duration_s || 0)}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">{ex.status}</Badge>
        </div>
      ))}
    </div>
  );
}
