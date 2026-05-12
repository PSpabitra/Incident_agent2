import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/utils/cn';

interface PageWrapperProps {
  children: ReactNode;
  /** Optional page title shown as breadcrumb at the top of content. */
  title?: string;
  description?: string;
  actions?: ReactNode;
  /** Render content edge-to-edge without the standard padded container. */
  bare?: boolean;
}

export function PageWrapper({ children, title, description, actions, bare }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <motion.main
          key={title}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex-1 min-w-0 overflow-y-auto custom-scrollbar',
            bare ? '' : 'mx-auto w-full max-w-7xl px-4 sm:px-6 py-6',
          )}
        >
          {(title || actions) && !bare && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}

          {children}
          {!bare && <div className="h-12" />} {/* Bottom spacer */}
        </motion.main>

        <Footer />
      </div>
    </div>
  );
}


