import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Mail,
  UserCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FloatingTopBarProps {
  isCollapsed?: boolean;
}

export const FloatingTopBar = ({
  isCollapsed = false,
}: FloatingTopBarProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get user's display name or email as fallback
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  
  // Get user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user role from localStorage
  const userRole = currentUser ? localStorage.getItem(`user_${currentUser.uid}_role`) || 'User' : 'User';
  const displayRole = userRole === 'teacher' ? 'Teacher' : userRole === 'student' ? 'Student' : 'User';

  return (
    <motion.div
      className="fixed top-4 right-4 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-200/50 px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-gray-100 rounded-full w-9 h-9 p-0"
          >
            <Bell size={16} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 rounded-full px-2 py-1 transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={currentUser?.photoURL || "https://github.com/shadcn.png"} />
                  <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={currentUser?.photoURL || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{displayRole}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Mail size={12} />
                  <span className="truncate">{currentUser?.email}</span>
                </div>
                {currentUser?.uid && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield size={12} />
                    <span className="truncate">ID: {currentUser.uid.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }} 
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};
