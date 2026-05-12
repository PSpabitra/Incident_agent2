import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, File as FileIcon, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Runbook' | 'Article';
  onSubmit: (data: { files: File[] }) => void;
  isLoading?: boolean;
}

const SUPPORTED_FORMATS = ['.csv', '.txt', '.docx', '.pdf'];
const ACCEPT_STR = SUPPORTED_FORMATS.join(',');

export function CreateContentModal({
  isOpen,
  onClose,
  type,
  onSubmit,
  isLoading = false,
}: CreateContentModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return SUPPORTED_FORMATS.includes(ext);
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    onSubmit({ files });
  };

  const resetAndClose = () => {
    setFiles([]);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={resetAndClose}
      title={`Create New ${type}`}
      description={`Upload documents to train the AI agent on your ${type.toLowerCase()} procedures.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Upload Files</label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer group',
              'flex flex-col items-center justify-center gap-3 text-center',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50',
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={ACCEPT_STR}
              multiple
              className="hidden"
            />
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: {SUPPORTED_FORMATS.join(', ')}
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Selected Files ({files.length})
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-critical hover:bg-critical/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={files.length === 0 || isLoading}
          >
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  );
}
