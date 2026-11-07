'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  ArrowLeft,
  Bell,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: BookOpen, label: 'Examinations', path: '/admin/examinations' },
    { icon: Bell, label: 'Notices', path: '/admin/notices' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: BookMarked, label: 'All Books', path: '/admin#books' },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-[#1e3a5f] text-white transition-all duration-300 relative border-r border-[#2a4a7a] select-none flex-shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#0d9488] p-2 rounded-xl shadow-sm">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-extrabold text-lg tracking-tight whitespace-nowrap">
            PINENE <span className="text-[#0d9488]">ADMIN</span>
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isExam = item.path === '/admin/examinations';
          const isNotice = item.path === '/admin/notices';
          const isOrder = item.path === '/admin/orders';
          const isActive = isExam 
            ? pathname?.startsWith('/admin/examinations')
            : isNotice
            ? pathname?.startsWith('/admin/notices')
            : isOrder
            ? pathname?.startsWith('/admin/orders')
            : pathname === item.path;

          return (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group hover:bg-[#2a4a7a]",
                isActive ? "bg-[#0d9488] text-white font-semibold" : "text-gray-300 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-white" : "group-hover:scale-110 transition-transform"
              )} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-[#2a4a7a]/60">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-[#2a4a7a] text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Back to Main Site</span>}
          </Link>
        </div>
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-[#2a4a7a] space-y-3">
        {!isCollapsed && (
          <div className="px-3 py-2 bg-[#2a4a7a]/40 rounded-xl">
            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
            <p className="text-sm font-bold truncate capitalize">{user?.username || 'Staff Admin'}</p>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 text-red-300 hover:text-red-100 hover:bg-red-900/30 px-3 py-2.5 rounded-xl h-auto",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
        </Button>
      </div>

      {/* Toggle Button */}
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

