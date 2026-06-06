import React from "react";
import { Outlet } from "react-router-dom";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} userType="student" />
      <FloatingTopBar isCollapsed={isCollapsed} />
      
      {/* 
        This margin left ensures content doesn't get hidden behind the sidebar on desktop.
        On mobile, sidebar is hidden or covers the screen, so ml-0.
      */}
      <div className={`transition-all duration-300 ${isMobile ? "ml-0" : isCollapsed ? "ml-20" : "ml-72"} relative`}>
        <Outlet />
      </div>
    </div>
  );
};
