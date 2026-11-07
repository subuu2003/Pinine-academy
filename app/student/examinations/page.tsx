'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  Lock,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { StudentSidebar } from '@/components/student/StudentSidebar';

interface StudentExam {
  id: number;
  title: string;
  description: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  start_datetime: string;
  end_datetime: string;
  current_status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  is_available: boolean;
  server_time: string;
  created_at: string;
}

function StudentExaminationsContent() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [examinations, setExaminations] = useState<StudentExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    const filterFromUrl = searchParams.get('status')?.toUpperCase();
    if (filterFromUrl && ['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'].includes(filterFromUrl)) {
      setStatusFilter(filterFromUrl as any);
    }
  }, [searchParams]);

  const fetchExaminations = async () => {
    setIsLoading(true);
    try {
      let url = '/examinations/?';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      url += params.toString();

      const res = await apiClient.get(url);
      setExaminations(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err: any) {
      toast.error('Failed to load examinations. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchExaminations();
    }
  }, [isAuthenticated, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExaminations();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const ongoingCount = examinations.filter(e => e.current_status === 'ONGOING').length;
  const upcomingCount = examinations.filter(e => e.current_status === 'UPCOMING').length;
  const completedCount = examinations.filter(e => e.current_status === 'COMPLETED').length;

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
                Online Examinations Hall
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Scheduled mock tests, ongoing exam windows, and syllabus milestones.
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
              onClick={fetchExaminations}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]"
            >
              Refresh
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Ongoing Exam Highlight Alert if available */}
          {ongoingCount > 0 && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    {ongoingCount} Examination{ongoingCount > 1 ? 's' : ''} Currently Active & Ongoing!
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">
                    The examination window is open. Enter the test hall below before time runs out.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setStatusFilter('ONGOING')}
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-xs px-5 h-10 shadow-xs shrink-0"
              >
                View Active Exams
              </Button>
            </div>
          )}

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setStatusFilter('ONGOING')}
              className={cn(
                "p-5 rounded-3xl border transition-all cursor-pointer",
                statusFilter === 'ONGOING' 
                  ? "bg-emerald-50 border-emerald-300 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live & Ongoing</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-3xl font-black text-emerald-600 mt-2">{ongoingCount}</div>
              <p className="text-xs text-gray-500 mt-1">Available for attempt right now</p>
            </div>

            <div 
              onClick={() => setStatusFilter('UPCOMING')}
              className={cn(
                "p-5 rounded-3xl border transition-all cursor-pointer",
                statusFilter === 'UPCOMING' 
                  ? "bg-blue-50 border-blue-300 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Ahead</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-[#1e3a5f] mt-2">{upcomingCount}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled for upcoming dates</p>
            </div>

            <div 
              onClick={() => setStatusFilter('COMPLETED')}
              className={cn(
                "p-5 rounded-3xl border transition-all cursor-pointer",
                statusFilter === 'COMPLETED' 
                  ? "bg-slate-100 border-slate-300 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concluded Tests</span>
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-black text-gray-700 mt-2">{completedCount}</div>
              <p className="text-xs text-gray-500 mt-1">Duration window concluded</p>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    statusFilter === filter
                      ? "bg-[#1e3a5f] text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {filter === 'ALL' ? 'All Exams' : filter}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search examination title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 h-10 rounded-xl bg-gray-50 border-gray-200 text-xs"
              />
            </form>
          </div>

          {/* Exam Grid */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0d9488] animate-spin mx-auto" />
              <p className="text-xs font-medium text-gray-500">Loading student examinations...</p>
            </div>
          ) : examinations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto space-y-3">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">No examinations match criteria</h3>
              <p className="text-xs text-gray-500">
                {statusFilter !== 'ALL'
                  ? `There are no ${statusFilter.toLowerCase()} examinations currently scheduled.`
                  : "No examinations are currently published."}
              </p>
              {statusFilter !== 'ALL' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setStatusFilter('ALL')}
                  className="rounded-xl text-xs mt-2"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examinations.map((exam) => {
                const isOngoing = exam.current_status === 'ONGOING';
                const isUpcoming = exam.current_status === 'UPCOMING';

                return (
                  <div
                    key={exam.id}
                    className={cn(
                      "bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md",
                      isOngoing 
                        ? "border-emerald-300 ring-2 ring-emerald-100" 
                        : "border-gray-100 hover:border-teal-200"
                    )}
                  >
                    <div className="space-y-4">
                      {/* Top Status Badge */}
                      <div className="flex items-center justify-between">
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ONGOING / LIVE
                          </span>
                        ) : isUpcoming ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-500" />
                            UPCOMING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-lg font-bold text-[#1e3a5f] group-hover:text-[#0d9488] transition-colors line-clamp-2">
                          {exam.title}
                        </h3>
                        {exam.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                            {exam.description}
                          </p>
                        )}
                      </div>

                      {/* Schedule Metadata */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date:
                          </span>
                          <span className="font-bold">{formatDate(exam.exam_date)}</span>
                        </div>

                        <div className="flex items-center justify-between text-gray-700">
                          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400" /> Start Time:
                          </span>
                          <span className="font-bold">{formatTime(exam.start_time)}</span>
                        </div>

                        <div className="flex items-center justify-between text-gray-700">
                          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Duration:
                          </span>
                          <span className="font-bold text-[#0d9488]">
                            {exam.duration_minutes} Mins ({(exam.duration_minutes / 60).toFixed(1)} hrs)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom / Action */}
                    <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                      <Link href={`/student/examinations/${exam.id}`} className="block">
                        <Button
                          className={cn(
                            "w-full rounded-xl font-bold text-xs h-10 gap-2 shadow-xs",
                            isOngoing
                              ? "bg-[#0d9488] hover:bg-[#0f766e] text-white"
                              : "bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white"
                          )}
                        >
                          {isOngoing ? "Enter Examination Room" : "View Exam Details"}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudentExaminationsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    }>
      <StudentExaminationsContent />
    </React.Suspense>
  );
}
