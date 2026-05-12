import { appConfig } from '@/config/app.config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 px-6 py-3 text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            All systems operational
          </span>
          <span>v{appConfig.version}</span>
          
        </div>
      </div>
    </footer>
  );
}
