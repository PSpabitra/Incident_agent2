import { useState } from 'react';
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
    mutationFn: (file: File) => kbApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb'] });
      setIsModalOpen(false);
    },
  });

  const handleCreate = async (data: { files: File[] }) => {
    if (data.files.length > 0) {
      uploadMutation.mutate(data.files[0]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="h-full flex flex-col cursor-pointer group">
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px]">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {article.id}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="muted" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {article.views}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {article.helpful}
                      </span>
                    </span>
                    <span>{formatRelativeTime(article.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
