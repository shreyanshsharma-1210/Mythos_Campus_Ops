import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/contexts/SidebarContext";
import { FloatingSidebar } from "./FloatingSidebar";
import { FloatingTopBar } from "./FloatingTopBar";

interface PageLayoutProps {
  children: React.ReactNode;
  userType?: "teacher" | "student";
}

export function PageLayout({ children, userType = "student" }: PageLayoutProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <FloatingSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          userType={userType}
        />
      )}
      <FloatingTopBar isCollapsed={isCollapsed} />
      <motion.main
        className={`min-h-screen pt-24 ${isMobile ? "p-4" : "p-8"}`}
        animate={{ marginLeft: isMobile ? 0 : isCollapsed ? 80 : 272 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.main>
    </div>
  );
}
