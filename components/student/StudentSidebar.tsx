'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  BookMarked, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Headphones,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';

interface StudentSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export function StudentSidebar({
  isCollapsed,
  setIsCollapsed,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [ongoingCount, setOngoingCount] = useState<number>(0);

  // Fetch count of currently ongoing/available examinations for live badge
  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const res = await apiClient.get('/examinations/available/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setOngoingCount(data.length);
      } catch {
        // Silently catch
      }
    };
    fetchActiveCount();
  }, [pathname]);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: CalendarCheck, 
      label: 'Examinations', 
      path: '/examinations',
      badge: ongoingCount > 0 ? `${ongoingCount} Live` : undefined,
    },
    { 
      icon: BookMarked, 
      label: 'Books & Materials', 
      path: '/books' 
    },
    { 
      icon: User, 
      label: 'My Profile', 
      path: '/profile' 
    },
    { 
      icon: Headphones, 
      label: 'Academic Support', 
      path: '/contact' 
    },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-[#1e3a5f] text-white transition-all duration-300 relative border-r border-[#2a4a7a] select-none shrink-0 z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#2a4a7a]/60">
        <div className="bg-[#0d9488] p-2 rounded-xl shadow-sm shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <span className="font-extrabold text-base tracking-tight whitespace-nowrap block">
              PINENE <span className="text-[#0d9488]">STUDENT</span>
            </span>
            <span className="text-[10px] text-teal-300 font-semibold tracking-wider uppercase block">
              Academic Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 mt-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isExam = item.path === '/examinations';
          const isActive = isExam
            ? pathname?.startsWith('/examinations')
            : pathname === item.path;

          return (
            <div key={item.label} className="space-y-1">
              <Link
                href={item.path}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group hover:bg-[#2a4a7a]",
                  isActive ? "bg-[#0d9488] text-white font-semibold shadow-xs" : "text-gray-300 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-white" : "group-hover:scale-110 transition-transform"
                  )} />
                  {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>

            </div>
          );
        })}

        {/* Back to Public Site link */}
        <div className="pt-4 border-t border-[#2a4a7a]/60">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-[#2a4a7a] text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Public Website</span>}
          </Link>
        </div>
      </nav>

      {/* Student Profile & Logout Section */}
      <div className="p-3.5 border-t border-[#2a4a7a] space-y-2.5 bg-[#172e4c]/50">
        {!isCollapsed && (
          <div className="px-3 py-2 bg-[#2a4a7a]/50 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
                Student Enrollee
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-sm font-bold truncate capitalize text-white">
              {user?.full_name || user?.first_name || user?.username || 'Student'}
            </p>
            <p className="text-[11px] text-gray-300 truncate">
              {user?.grade || 'Class 10'} • {user?.target_exam || 'JEE Prep'}
            </p>
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-2.5 text-red-300 hover:text-red-100 hover:bg-red-900/30 px-3 py-2 rounded-xl h-auto text-xs font-semibold",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-[#0d9488] p-1.5 rounded-full border-2 border-[#1e3a5f] hover:scale-110 transition-transform shadow-lg z-20"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-white" /> : <ChevronLeft className="w-3.5 h-3.5 text-white" />}
      </button>
    </aside>
  );
}
