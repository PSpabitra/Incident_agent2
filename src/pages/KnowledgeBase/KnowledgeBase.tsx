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
  FileText,
  Download,
  Archive,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { CreateContentModal } from '@/components/shared/CreateContentModal';
import { Sheet } from '@/components/ui/Sheet';
import { kbApi } from '@/services/api/endpoints';
import { formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import type { KBArticle } from '@/types';
import { ManualRichSummary } from '../../components/shared/ManualRichSummary';
import { useToast } from '@/hooks/useToast';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

type FilterTab = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType] = useState<'Article'>('Article');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<KBArticle | null>(null);

  const { success, error } = useToast();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<KBArticle[]>({
    queryKey: ['kb'],
    queryFn: () => kbApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => kbApi.upload(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb'] });
      setIsModalOpen(false);
      success('Upload Successful', 'Article uploaded and indexed successfully.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => kbApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb'] });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      success('Article Deleted', 'The article has been permanently removed.');
    },
    onError: () => {
      error('Delete Failed', 'Could not delete the article. Please try again.');
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

  const [archivedIds, setArchivedIds] = useState<Set<string | number>>(() => {
    const saved = localStorage.getItem('archived_articles');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  const handleArchive = (id: string | number) => {
    const next = new Set(archivedIds);
    next.add(id);
    setArchivedIds(next);
    localStorage.setItem('archived_articles', JSON.stringify(Array.from(next)));
    setSelectedArticle(null);
    success('Article Archived', 'The article has been moved to archive locally.');
  };

  const handleDownloadTxt = (article: KBArticle) => {
    const title = article.title || 'Untitled Article';
    const content = `
KNOWLEDGE BASE ARTICLE: ${title}
CATEGORY: ${article.category || 'General'}
UPDATED: ${article.updatedAt || article.createdAt || new Date().toISOString()}
--------------------------------------------------
CONTENT SUMMARY:
${renderDescription(article)}

TAGS: ${article.tags?.join(', ') || 'None'}
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_article.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Article downloaded in TXT format');
  };

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((article) => {
        const title = article.title?.toLowerCase() || '';
        const category = article.category?.toLowerCase() || '';
        const tags = article.tags?.map(t => t.toLowerCase()).join(' ') || '';
        const summary = renderDescription(article).toLowerCase();

        return title.includes(s) || category.includes(s) || tags.includes(s) || summary.includes(s);
      });
    }

    if (filterTab === 'ALL') {
      list = list.filter((a) => !archivedIds.has(a.id));
    } else if (filterTab === 'ARCHIVED') {
      list = list.filter((a) => archivedIds.has(a.id));
    } else if (filterTab === 'PUBLISHED') {
      list = list.filter((a) => a.isPublished && !archivedIds.has(a.id));
    } else if (filterTab === 'DRAFT') {
      list = list.filter((a) => !a.isPublished && !archivedIds.has(a.id));
    }

    return list;
  }, [data, search, filterTab, archivedIds]);

  const stats = [
    {
      label: 'TOTAL ARTICLES',
      value: data?.length || 0,
      sub: 'verified knowledge assets',
      icon: BookOpen,
      color: 'text-indigo-500',
    },
    {
      label: 'PUBLISHED',
      value: data?.filter((a) => a.isPublished).length || 0,
      sub: 'available for RAG',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      label: 'TOP CATEGORY',
      value: 'SRE',
      sub: 'most active domain',
      icon: Layers,
      color: 'text-amber-500',
    },
    {
      label: 'KNOWLEDGE GAP',
      value: '12%',
      sub: 'unresolved queries',
      icon: RefreshCw,
      color: 'text-cyan-500',
    },
  ];

  const ensureString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (!val) return '';
    if (typeof val === 'object') {
      return val.description || val.summary || val.overview || val.title || val.name || JSON.stringify(val);
    }
    return String(val);
  };

  const renderDescription = (article: KBArticle) => {
    const s = article.summary;
    if (typeof s === 'string') return s || 'No content available.';
    if (typeof s === 'object' && s !== null) {
      const obj = s as any;
      return ensureString(
        obj.description ||
        obj.summary ||
        obj.overview ||
        obj.overview_summary ||
        (Array.isArray(obj.key_features) ? obj.key_features.join(', ') : '')
      ) || 'No description available.';
    }
    return 'No content available.';
  };

  if (isLoading) return <PageSpinner />;

  return (
    <PageWrapper bare noScroll>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 h-full flex flex-col space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 text-slate-900">
              <BookOpen className="h-7 w-7 text-slate-800" /> Knowledge Base
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              AI-generated articles from incident resolutions · stored in RAG vector store
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 text-slate-600 font-bold text-[11px] tracking-widest h-10 px-4"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['kb'] })}
            >
              REFRESH
            </Button> */}
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-[11px] tracking-widest h-10 px-5 shadow-lg shadow-blue-100"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              NEW ARTICLE
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 flex-none">
          {stats.map((s) => (
            <Card key={s.label} className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  {s.label}
                </p>
                <div className={cn('p-2 rounded-xl bg-white border border-slate-100 shadow-sm', s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-4xl font-bold text-slate-900">{s.value}</h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium italic">{s.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter/Search Bar */}
        <Card className="p-2 border-slate-100 shadow-sm flex-none">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search articles, tags, or knowledge..."
                className="pl-11 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 pr-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {(['ALL', 'PUBLISHED', 'ARCHIVED'] as FilterTab[]).map((tab) => (
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
              ))}
            </div>
          </div>
        </Card>

        {/* Table View */}
        <Card className="overflow-hidden border-slate-100 shadow-sm rounded-xl flex-1 flex flex-col min-h-0 bg-white">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <PageSpinner />
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <Table className="border-none border-separate border-spacing-0">
                <THead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                  <TR className="hover:bg-transparent border-none">
                    <TH className="px-8 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">ARTICLE</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">CATEGORY</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">TAGS</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold text-center bg-slate-50 sticky top-0 z-20 border-b border-slate-100">STATUS</TH>
                    <TH className="px-6 py-5 text-slate-400 text-[10px] tracking-widest font-bold bg-slate-50 sticky top-0 z-20 border-b border-slate-100">UPDATED</TH>
                    <TH className="px-8 py-5 text-slate-400 text-[10px] tracking-widest font-bold text-right bg-slate-50 sticky top-0 z-20 border-b border-slate-100">ACTIONS</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((article) => (
                    <TR key={article.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TD className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[15px] text-slate-800">{ensureString(article.title)}</span>
                          <Badge variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100/50 text-[9px] font-bold px-1.5 h-5 flex items-center justify-center tracking-tighter">
                            KB
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-1 max-w-md font-medium">
                          {renderDescription(article)}
                        </p>
                      </TD>
                      <TD className="px-6 py-6">
                        <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                          {ensureString(article.category) || 'GENERAL'}
                        </span>
                      </TD>
                      <TD className="px-6 py-6">
                        <div className="flex flex-wrap gap-1">
                          {article.tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[9px] font-bold text-slate-500 border-slate-200 bg-white px-1.5">
                              {tag.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </TD>
                      <TD className="px-6 py-6 text-center">
                        <Badge
                          variant={article.isPublished ? 'success' : 'muted'}
                          className="text-[10px] font-bold uppercase tracking-widest px-2.5 h-6"
                        >
                          {article.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </Badge>
                      </TD>
                      <TD className="px-6 py-6 whitespace-nowrap">
                        <span className="text-[13px] text-slate-400 font-medium">
                          {formatRelativeTime(article.updatedAt || article.createdAt || new Date())}
                        </span>
                      </TD>
                      <TD className="px-8 py-6">
                        <div className="flex items-center justify-end gap-5">
                          <button
                            onClick={() => setSelectedArticle(article)}
                            className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors tracking-widest"
                          >
                            VIEW
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(article);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-slate-300 hover:text-rose-500 transition-all transform hover:scale-110"
                          >
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

      {/* Article Detail Sidebar */}
      <Sheet
        open={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        size="lg"
        title={
          selectedArticle && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] font-bold px-2 h-5 tracking-widest uppercase">
                    {selectedArticle.category || 'GENERAL'}
                  </Badge>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{ensureString(selectedArticle.title)}</h2>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Created by <span className="text-slate-600 font-bold">{selectedArticle.author || 'AI Learning Agent'}</span> · {formatRelativeTime(selectedArticle.updatedAt || selectedArticle.createdAt || new Date())}
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
                onClick={() => selectedArticle && handleArchive(selectedArticle.id)}
                disabled={!!(selectedArticle && archivedIds.has(selectedArticle.id))}
              >
                {selectedArticle && archivedIds.has(selectedArticle.id) ? 'ARCHIVED' : 'ARCHIVE'}
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold tracking-widest h-10 px-6 shadow-lg shadow-blue-100"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => selectedArticle && handleDownloadTxt(selectedArticle)}
            >
              DOWNLOAD ARTICLE
            </Button>
          </div>
        }
      >
        {selectedArticle && (
          <div className="space-y-6 pb-10">
            <ManualRichSummary
              data={(() => {
                const s = selectedArticle.summary;
                if (typeof s === 'object' && s !== null) {
                  const obj = s as any;
                  return {
                    ...obj,
                    overview: ensureString(obj.overview || obj.description || obj.summary || ''),
                    features: Array.isArray(obj.features) ? obj.features.map(ensureString) : (Array.isArray(obj.key_features) ? obj.key_features.map(ensureString) : []),
                    prerequisites: Array.isArray(obj.prerequisites) ? obj.prerequisites : [],
                  };
                }
                return { overview: renderDescription(selectedArticle) };
              })()}
            />
          </div>
        )}
      </Sheet>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Article?"
        message={`Are you sure you want to delete "${ensureString(itemToDelete?.title) || 'this article'}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
      />

      <CreateContentModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={uploadMutation.isPending}
      />
    </PageWrapper>
  );
}
