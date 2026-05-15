import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  GitBranch,
  AlertOctagon,
  Activity,
  Settings,
  Sparkles,
  Plug,
  Network,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { appConfig } from "@/config/app.config";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  roles?: Array<"admin" | "engineer" | "user">;
}

const navItems: NavItem[] = [
  { to: appConfig.routes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: "/connectors", label: "Connectors", icon: Plug, roles: ["admin"] },
  {
    to: appConfig.routes.incidents,
    label: "Incident Queue",
    icon: Inbox,
    badge: "live",
  },
  // {
  //   to: appConfig.routes.incidentLoop,
  //   label: "Incident Loop",
  //   icon: RotateCcw,
  // },
  { to: appConfig.routes.runbooks, label: "Runbooks", icon: GitBranch },
  {
    to: appConfig.routes.knowledgeBase,
    label: "Knowledge Base",
    icon: BookOpen,
  },
  // { to: "/knowledge-graph", label: "Knowledge Graph", icon: Network },
   {
    to: appConfig.routes.incidentLoop,
    label: "Incident Timeline",
    icon: RotateCcw,
  },
  {
    to: appConfig.routes.escalations,
    label: "Escalations",
    icon: AlertOctagon,
    roles: ["engineer", "admin"],
  },
  { to: appConfig.routes.actions, label: "Activity Logs", icon: Activity },
  // { to: appConfig.routes.settings, label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavList({ onItemClick }: { onItemClick?: () => void }) {
  const { user } = useAuth();
  const userRole = user?.role as "admin" | "engineer" | "user" | undefined;

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  });

  return (
    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
      {filteredItems.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === appConfig.routes.dashboard}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "group flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-surface-hover",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span>{label}</span>
              </span>
              {badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground truncate">
              {appConfig.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              v{appConfig.version}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-hover"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <NavList onItemClick={onClose} />

      <div className="p-3 border-t border-border">
        <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-3 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              AI Agent Active
            </p>
          </div>
          {/* <p className="text-[11px] leading-relaxed text-muted-foreground">
            5 agents online, monitoring 12 channels.
          </p> */}
        </div>
      </div>
    </div>
  );
}


export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border bg-surface">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-surface border-r border-border"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


