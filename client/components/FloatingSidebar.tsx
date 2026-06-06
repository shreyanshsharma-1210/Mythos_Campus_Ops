import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wrench,
  BookOpen,
  LayoutGrid,
  ScanSearch,
  Activity,
  Flag,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FloatingSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userType?: "teacher" | "student";
}

const NAV_ITEMS = [
  { id: "home",       label: "Dashboard",       icon: LayoutGrid, href: "/dashboard2" },
  { id: "grievances", label: "Grievances",       icon: Flag,        href: "/grievances/submit" },
  { id: "maintenance",label: "Maintenance",      icon: Wrench,      href: "/maintenance/report" },
  { id: "policy",     label: "Policy Navigator", icon: BookOpen,    href: "/policy" },
  { id: "lost-found", label: "Lost & Found",     icon: ScanSearch,  href: "/lost-found" },
  { id: "heatmap",    label: "Heatmap",          icon: Activity,    href: "/heatmap" },
];

export const FloatingSidebar = ({
  isCollapsed,
  setIsCollapsed,
  userType = "student",
}: FloatingSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const userName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      if (currentUser) localStorage.removeItem(`user_${currentUser.uid}_role`);
      await logout();
    } catch {
      /* ignore */
    } finally {
      navigate("/login");
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        className="fixed left-4 top-4 bottom-4 z-50"
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{ pointerEvents: "auto" }}
      >
        <div className="h-full flex flex-col bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

          {/* ── Brand Header ── */}
          <div
            className={cn(
              "flex items-center border-b border-border shrink-0",
              isCollapsed ? "p-3 justify-center" : "px-4 py-3 gap-3"
            )}
          >
            {/* Icon mark */}
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="text-[15px] font-display font-black text-foreground uppercase tracking-wide leading-none whitespace-nowrap">
                    Campus
                    <span className="text-primary">OS</span>
                  </p>
                  <p className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase mt-0.5 whitespace-nowrap">
                    v2.0 · ONLINE
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Navigation ── */}
          <div className="flex-1 overflow-y-auto p-2 space-y-px">
            {!isCollapsed && (
              <p className="text-[8px] font-mono font-bold text-muted-foreground tracking-widest uppercase px-2 pt-2 pb-2">
                Modules
              </p>
            )}

            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);

              const button = (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center rounded-xl transition-colors duration-100 group",
                    isCollapsed ? "p-2 justify-center" : "px-3 py-2.5 gap-3",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  <item.icon
                    size={17}
                    strokeWidth={1.75}
                    className={cn(
                      "shrink-0 transition-colors",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        className="text-sm font-medium text-left truncate leading-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="font-mono text-xs tracking-widest uppercase"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <Fragment key={item.id}>{button}</Fragment>;
            })}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-border p-2 space-y-1 shrink-0">

            {/* User identity row */}
            <AnimatePresence initial={false} mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="expanded-user"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                >
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={currentUser?.photoURL || ""} />
                    <AvatarFallback className="text-[10px] font-display font-black bg-secondary text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display font-black text-foreground uppercase tracking-wide truncate leading-none">
                      {userName}
                    </p>
                    <p className="text-[8px] font-mono text-muted-foreground tracking-widest mt-0.5">
                      {userType === "teacher" ? "FACULTY" : "STUDENT"} · ACTIVE
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-user"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-center py-1"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={currentUser?.photoURL || ""} />
                    <AvatarFallback className="text-[10px] font-display font-black bg-secondary text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors duration-100",
                    isCollapsed ? "p-2 justify-center" : "px-3 py-2.5 gap-3"
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOut size={17} strokeWidth={1.75} className="shrink-0" />
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        Log out
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="font-mono text-xs tracking-widest uppercase">
                  Log out
                </TooltipContent>
              )}
            </Tooltip>

            {/* Collapse toggle */}
            <div className="flex justify-center pt-0.5">
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-100"
                whileTap={{ scale: 0.95 }}
              >
                {isCollapsed
                  ? <ChevronRight size={13} strokeWidth={2} />
                  : <ChevronLeft size={13} strokeWidth={2} />}
              </motion.button>
            </div>
          </div>

        </div>
      </motion.div>
    </TooltipProvider>
  );
};
