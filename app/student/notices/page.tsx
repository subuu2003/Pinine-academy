'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Search, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Megaphone,
  Download,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { 
  NoticeItem, 
  NOTICE_CATEGORIES, 
  getCategoryBadgeClass, 
  getCategoryLabel, 
  formatNoticeDateShort 
} from '@/lib/notices';
import { StudentSidebar } from '@/components/student/StudentSidebar';

export default function StudentNoticesPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await apiClient.get(`/notices/?${params.toString()}`);
      setNotices(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotices();
    }
  }, [isAuthenticated, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Student Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Academic Notice Board
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Official circulars, exam announcements, and administrative advisories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotices}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]"
            >
              Refresh
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-3">
                  <Megaphone className="w-3.5 h-3.5 text-teal-300" />
                  Syllabus Updates & Circulars
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Announcements for {user?.grade || 'Class 10'}
                </h2>
                <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xl">
                  Stay updated on schedule revisions, admit card releases, mock exam dates, and academic announcements.
                </p>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search circulars by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
              />
            </form>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                  selectedCategory === 'ALL'
                    ? "bg-[#1e3a5f] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                All Notices
              </button>

              {NOTICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                    selectedCategory === cat.value
                      ? "bg-[#0d9488] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}

              {(searchQuery || selectedCategory !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 h-9 px-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Notices Grid */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading student announcements...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No Circulars Found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery || selectedCategory !== 'ALL'
                  ? "No circulars match your active filters. Try clearing your search."
                  : "There are currently no circulars published. Check back soon for fresh updates."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices.map((notice) => {
                const isImportant = notice.category === 'IMPORTANT';
                return (
                  <article
                    key={notice.id}
                    className={cn(
                      "bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between hover:shadow-lg relative group",
                      isImportant
                        ? "border-rose-200 bg-gradient-to-b from-rose-50/20 to-white ring-1 ring-rose-200/50"
                        : "border-gray-100 shadow-sm hover:border-teal-200"
                    )}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                            getCategoryBadgeClass(notice.category)
                          )}>
                            {getCategoryLabel(notice.category)}
                          </span>
                          {isImportant && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                              Priority Alert
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatNoticeDateShort(notice.publish_date)}</span>
                        </div>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-[#1e3a5f] group-hover:text-[#0d9488] transition-colors leading-snug">
                        {notice.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {notice.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      {notice.expiry_date ? (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until {formatNoticeDateShort(notice.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Official Student Circular</span>
                      )}

                      <Link href={`/notices/${notice.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs font-bold text-[#0d9488] hover:text-[#0f766e] hover:bg-teal-50 rounded-xl px-3 flex items-center gap-1.5"
                        >
                          Full Circular View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
