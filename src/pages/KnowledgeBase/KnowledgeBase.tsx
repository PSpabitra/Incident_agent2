import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, BookOpen, Eye, ThumbsUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { CreateContentModal } from '@/components/shared/CreateContentModal';
import { kbApi } from '@/services/api/endpoints';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeTime } from '@/utils/formatters';

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Runbook' | 'Article'>('Article');
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['kb', debouncedSearch],
    queryFn: () => (debouncedSearch ? kbApi.search(debouncedSearch) : kbApi.list()),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => kbApi.upload(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb'] });
      setIsModalOpen(false);
    },
  });

  const handleCreate = async (data: { files: File[] }) => {
    if (data.files.length > 0) {
      uploadMutation.mutate(data.files);
    }
  };

  return (
    <PageWrapper
      title="Knowledge Base"
      description="Continuously updated articles drafted by the KB Learning Agent."
      actions={
        <div className="flex gap-2">

          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setModalType('Article');
              setIsModalOpen(true);
            }}
          >
            New Article
          </Button>
        </div>
      }
    >
      <CreateContentModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={uploadMutation.isPending}
      />

      <Card className="mb-6">
        <div className="px-4 py-4">
          <Input
            placeholder="Search articles by title, content, or tag…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No articles found"
            description="Try a different search term or create the first article."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
          {data.map((article, idx) => (
            <KnowledgeBaseCard key={article.id} article={article} idx={idx} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function KnowledgeBaseCard({ article, idx }: { article: any; idx: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [article.summary?.summary]);

  const hasExtraSteps = 
    typeof article.summary === 'object' && (
      ((article.summary.description as any)?.approvals || []).length > 0 ||
      ((article.summary.description as any)?.verification || []).length > 0
    );

  const showButton = isExpanded || isClamped || hasExtraSteps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
    >
      <Card className="max-h-[500px] overflow-y-auto flex flex-col cursor-pointer group">
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {(typeof article.summary === 'object' ? article.summary?.category : null) ||
                article.category ||
                'General'}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{article.id}</span>
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {(typeof article.summary === 'object' ? article.summary?.name : null) || article.title}
          </h3>
          <div className="mt-2 space-y-3 flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {(() => {
                const s = article.summary;
                if (typeof s === 'object' && s !== null) {
                  return (s.description as any)?.purpose || s.summary || s.overview || 'No summary available.';
                }
                return s || 'No summary available.';
              })()}
            </p>

            {typeof article.summary === 'object' && article.summary?.description && (
              <div className="space-y-2">
                <div className="relative">
                  <p 
                    ref={textRef}
                    className={`text-[11px] text-muted-foreground italic border-l-2 border-primary/20 pl-2 ${!isExpanded ? 'line-clamp-2' : ''}`}
                  >
                    {article.summary.summary || 'Summary not available.'}
                  </p>
                </div>

                {isExpanded && (
                  <div className="pt-2 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {((article.summary.description as any).approvals || []).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">Approvals Required</p>
                        <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc pl-3">
                          {(article.summary.description as any).approvals.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {((article.summary.description as any).verification || []).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">Verification Steps</p>
                        <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc pl-3">
                          {(article.summary.description as any).verification.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {showButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-[10px] font-medium text-primary hover:underline focus:outline-none"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {(article.tags || []).slice(0, 3).map((t: string) => (
              <Badge key={t} variant="muted" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-y-1 text-[10px] text-muted-foreground">
            <span className="font-medium">By: {article.author || 'System'}</span>
            <div className="flex items-center gap-2">
              <span>Created {formatRelativeTime(article.createdAt)}</span>
              <span className="text-border">•</span>
              <span>Updated {formatRelativeTime(article.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
