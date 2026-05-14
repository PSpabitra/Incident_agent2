import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, FileText, File as FileIcon, AlertCircle, CheckCircle2, Wand2, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Runbook' | 'Article';
  onSubmit: (data: { files: File[] }) => void;
  onUpdate?: (id: string | number, data: any) => void;
  isLoading?: boolean;
  isUpdating?: boolean;
  processedData?: any;
  onReset?: () => void;
}

const SUPPORTED_FORMATS = ['.csv', '.txt', '.docx', '.pdf'];
const ACCEPT_STR = SUPPORTED_FORMATS.join(',');

const CATEGORIES = ['Git', 'Cloud', 'Infrastructure', 'Security', 'Database', 'Operations', 'Network'];

export function CreateContentModal({
  isOpen,
  onClose,
  type,
  onSubmit,
  onUpdate,
  isLoading = false,
  isUpdating = false,
  processedData = null,
  onReset,
}: CreateContentModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSteps, setEditSteps] = useState<string[]>([]);

  useEffect(() => {
    if (processedData) {
      const summary = processedData.summary || {};
      const richDesc = summary.description || {};
      
      setEditTitle(summary.name || processedData.name || processedData.title || '');
      setEditCategory(summary.category || processedData.category || 'Operations');
      
      const desc = typeof richDesc === 'object' 
        ? (richDesc.overview || richDesc.purpose || summary.summary || processedData.description || '')
        : (summary.description || processedData.description || '');
      setEditDescription(desc);

      const steps = processedData.steps || processedData.execution_steps || [];
      if (steps.length > 0) {
        setEditSteps(steps.map((s: any) => s.title || s));
      } else if (richDesc.setup_steps) {
        // Flatten setup steps if they exist
        const flattened = [
          ...(richDesc.setup_steps.api_token_creation || []),
          ...(richDesc.setup_steps.connector_configuration || []),
          ...(richDesc.setup_steps.webhook_setup || [])
        ];
        setEditSteps(flattened);
      } else {
        setEditSteps(['']);
      }
    }
  }, [processedData]);

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

  const handleFinalSubmit = () => {
    if (!processedData || !onUpdate) return;
    
    const payload: any = {
      name: editTitle,
      title: editTitle,
      category: editCategory,
      description: editDescription,
    };

    if (type === 'Runbook') {
      payload.steps = editSteps.filter(s => s.trim()).map((s, i) => ({
        order: i + 1,
        title: s,
      }));
    } else {
      payload.summary = {
        ...(processedData.summary || {}),
        name: editTitle,
        category: editCategory,
        summary: editDescription,
      };
    }

    onUpdate(processedData.id, payload);
  };

  const resetAndClose = () => {
    setFiles([]);
    onClose();
  };

  const addStep = () => setEditSteps([...editSteps, '']);
  const updateStep = (i: number, v: string) => {
    const next = [...editSteps];
    next[i] = v;
    setEditSteps(next);
  };
  const removeStep = (i: number) => setEditSteps(editSteps.filter((_, idx) => idx !== i));

  return (
    <Modal
      open={isOpen}
      onClose={resetAndClose}
      title={processedData ? "Review AI Suggestions" : `Create New ${type}`}
      description={processedData ? "You can edit anything before it is indexed into the RAG store" : `Upload documents to train the AI agent on your ${type.toLowerCase()} procedures.`}
      size={processedData ? "lg" : "md"}
    >
      {processedData ? (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Form Header Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Wand2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Review AI Suggestions</h3>
              <p className="text-[11px] text-slate-500">Edit extracted metadata to ensure high-quality RAG indexing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 bg-slate-50/50 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 bg-slate-50/50 resize-none"
            />
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Steps (extracted by AI — edit as needed)
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add step
              </button>
            </div>
            <div className="space-y-2">
              {editSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="w-5 h-8 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0 select-none">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 bg-white"
                    placeholder={`Step ${idx + 1}...`}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Pick a different file
            </button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={resetAndClose}>Cancel</Button>
              <Button 
                className="bg-slate-900 text-white hover:bg-black px-6"
                onClick={handleFinalSubmit}
                isLoading={isUpdating}
                leftIcon={<Check className="h-4 w-4 text-cyan-400" />}
              >
                UPLOAD & INDEX
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </Modal>
  );
}
