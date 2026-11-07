'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ChevronRight,
  Filter,
  CheckCircle2,
  Megaphone,
  Lock,
  GraduationCap,
  ShieldCheck
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
import { useAuth } from '@/lib/AuthContext';
import { RegisterPromptModal } from '@/components/auth/RegisterPromptModal';

function PublicNoticesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff);
  const isStudent = isAuthenticated && !isAdmin;

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [promptNotice, setPromptNotice] = useState<NoticeItem | null>(null);
  
  const initialCategory = searchParams.get('category')?.toUpperCase() || 'ALL';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const fetchPublicNotices = async () => {
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
    fetchPublicNotices();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicNotices();
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] via-[#244570] to-[#1e3a5f] text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-96 h-96 rounded-full bg-[#0d9488]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold tracking-wider uppercase text-teal-300">
            <Megaphone className="w-4 h-4 text-[#0d9488]" />
            Official Academy Notice Board
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Announcements & Circulars
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Stay informed with the latest examination notifications, admission milestones, academic schedules, and student advisories.
          </p>

          {/* Quick Category Bar */}
          <div className="pt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-white/60 font-medium">Categories:</span>
            {NOTICE_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "px-3 py-1 rounded-full transition-all text-xs font-semibold",
                  selectedCategory === cat.value
                    ? "bg-[#0d9488] text-white shadow-xs"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* 1. Unauthenticated CTA Alert Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-teal-900 to-[#1e3a5f] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-800">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-teal-200">
                <Sparkles className="w-3.5 h-3.5" />
                Official Academic Communications
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Create an Account or Login to View More
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Registered students receive verified PDF circulars, official exam schedules, syllabus guidelines, and automated notifications directly in their portal.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href="/sign-up?redirect=/notices">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl px-5 h-11 text-xs sm:text-sm shadow-md">
                  Create Account / Register
                </Button>
              </Link>
              <Link href="/sign-in?redirect=/notices">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-xl px-5 h-11 text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Authenticated Student Alert Banner */}
        {isStudent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Enrolled Student Portal
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Welcome, {user?.first_name || user?.username}! Access all circulars in your panel.
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Looking for class-specific circulars and exam schedules? View all announcements in your Student Notice Board.
                </p>
              </div>
            </div>

            <Link href="/student/notices" className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Student Notice Board
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* 3. Authenticated Admin Alert Banner */}
        {isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Administrator Session Active
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Manage Academic Circulars & Notices
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  To publish new announcements, edit active circulars, or archive expired notices, open the Admin Console.
                </p>
              </div>
            </div>

            <Link href="/admin/notices" className="shrink-0">
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Admin Notice Console
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Keyword Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search announcements by topic, exam, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-2xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
            />
          </form>

          {/* Category Filter Pills */}
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

        {/* Notices Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading academic notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-teal-50 text-[#0d9488] rounded-2xl flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1e3a5f]">No active notices found</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              {searchQuery || selectedCategory !== 'ALL'
                ? "There are currently no published notices matching your keyword or category filter. Try clearing filters."
                : "No announcements are active at this moment. Please check back regularly for examination notices and academic circulars."}
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-semibold px-4"
              >
                Show All Notices
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map((notice) => {
              const isImportant = notice.category === 'IMPORTANT';
              return (
                <article
                  key={notice.id}
                  className={cn(
                    "bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 hover:shadow-lg flex flex-col justify-between group",
                    isImportant
                      ? "border-rose-200 bg-gradient-to-b from-rose-50/20 to-white ring-1 ring-rose-200/50"
                      : "border-gray-200/80 hover:border-teal-300"
                  )}
                >
                  <div className="space-y-3.5">
                    {/* Notice Top Meta */}
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

                    {/* Notice Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-[#1e3a5f] group-hover:text-[#0d9488] transition-colors leading-snug">
                      <Link 
                        href={`/notices/${notice.id}`}
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            setPromptNotice(notice);
                          }
                        }}
                      >
                        {notice.title}
                      </Link>
                    </h2>

                    {/* Notice Summary / Preview */}
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {notice.short_description || notice.content}
                    </p>
                  </div>

                  {/* Notice Footer / Action */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    {notice.expiry_date ? (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Valid until {formatNoticeDateShort(notice.expiry_date)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">Official Circular</span>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          setPromptNotice(notice);
                        } else {
                          router.push(`/notices/${notice.id}`);
                        }
                      }}
                      className="text-xs font-bold text-[#0d9488] hover:text-[#0f766e] hover:bg-teal-50 rounded-xl px-3 group/btn flex items-center gap-1.5"
                    >
                      Read Notice
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Registration Prompt Modal for Unauthenticated Visitors */}
      <RegisterPromptModal
        isOpen={!!promptNotice}
        onClose={() => setPromptNotice(null)}
        title={promptNotice ? `Register to Access "${promptNotice.title}"` : undefined}
        itemName={promptNotice?.title}
        redirectPath={promptNotice ? `/notices/${promptNotice.id}` : '/notices'}
      />
    </div>
  );
}

export default function PublicNoticesPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    }>
      <PublicNoticesContent />
    </React.Suspense>
  );
}
