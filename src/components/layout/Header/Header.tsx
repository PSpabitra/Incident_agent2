import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User as UserIcon, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { appConfig } from '@/config/app.config';
// import { cn } from '@/utils/cn';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(appConfig.routes.welcome);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 justify-between">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-hover"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search incidents, runbooks, knowledge…"
            className={cn(
              'h-9 w-full rounded-md border border-border bg-background',
              'pl-10 pr-3 text-sm placeholder:text-muted-foreground/70',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            )}
          /> */}
          
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-surface" />
        </button> */}

        <ThemeToggle />

        <div ref={menuRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-hover transition-colors"
            aria-label="User menu"
            aria-haspopup="menu"
          >
            <Avatar name={user?.fullName ?? 'User'} size="sm" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-border bg-surface shadow-soft-lg overflow-hidden z-40"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.fullName ?? 'Guest'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? ''}
                  </p>
                  <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold bg-primary/10 text-primary">
                    {user?.role ?? 'guest'}
                  </span>
                </div>
                <div className="p-1">
                  <Link
                    to={appConfig.routes.settings}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-surface-hover transition-colors"
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    to={appConfig.routes.settings}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </div>
                <div className="p-1 border-t border-border">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-critical hover:bg-critical/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
