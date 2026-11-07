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
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { RegisterPromptModal } from '@/components/auth/RegisterPromptModal';

interface ExaminationItem {
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

function PublicExaminationsContent() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [examinations, setExaminations] = useState<ExaminationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [promptExam, setPromptExam] = useState<ExaminationItem | null>(null);

  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff);
  const isStudent = isAuthenticated && !isAdmin;

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
    fetchExaminations();
  }, [statusFilter]);

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

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Hero Header Section */}
      <section className="bg-gradient-to-r from-[#1e3a5f] via-[#244570] to-[#1e3a5f] text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-96 h-96 rounded-full bg-[#0d9488]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold tracking-wider uppercase text-teal-300">
            <Award className="w-4 h-4 text-[#0d9488]" />
            Official Examination Schedule
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Academic Examinations & Mock Tests
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            View published syllabus tests, upcoming dates, and testing windows. Enrolled students can launch live examination attempts via their Student Portal.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* 1. Unauthenticated CTA Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-teal-900 to-[#1e3a5f] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-800/50">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-teal-200">
                <Sparkles className="w-3.5 h-3.5" />
                Student Examination Portal
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Create an Account to Attempt Mock Examinations
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Registered students receive automated timers, question sets, instant grading, and detailed syllabus performance reports. Create a free account or sign in to participate.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href="/sign-up?redirect=/examinations">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl px-5 h-11 text-xs sm:text-sm shadow-md">
                  Create Account / Register
                </Button>
              </Link>
              <Link href="/sign-in?redirect=/examinations">
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
                  Enrolled Student Access Active
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Ready to take your examination, {user?.first_name || user?.username}?
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Access your dedicated exam room with live question bank, countdown timer, and answer submissions.
                </p>
              </div>
            </div>

            <Link href="/student/examinations" className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Open Student Exam Hall
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
                  Manage Official Examination Schedules
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  To create, edit, publish, or view student test submissions, visit the Admin Operations Console.
                </p>
              </div>
            </div>

            <Link href="/admin/examinations" className="shrink-0">
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Admin Exam Console
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { label: 'All Exams', value: 'ALL' },
              { label: 'Available Now', value: 'ONGOING', highlight: true },
              { label: 'Upcoming', value: 'UPCOMING' },
              { label: 'Completed', value: 'COMPLETED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                  statusFilter === tab.value
                    ? tab.highlight 
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[#1e3a5f] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {tab.highlight && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by examination title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 h-11 rounded-2xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
            />
          </form>
        </div>

        {/* Examination Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Checking scheduled examinations...</p>
          </div>
        ) : examinations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Examinations Found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'ALL'
                ? "No published examinations match your selected filter criteria. Try clearing search."
                : "There are currently no examinations scheduled. Check back shortly for upcoming syllabus tests!"}
            </p>
            {(searchQuery || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="rounded-xl"
              >
                Show All Examinations
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examinations.map((exam) => {
              const isOngoing = exam.current_status === 'ONGOING';
              const isUpcoming = exam.current_status === 'UPCOMING';
              const isCompleted = exam.current_status === 'COMPLETED';

              return (
                <div
                  key={exam.id}
                  className={cn(
                    "bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between hover:shadow-lg relative overflow-hidden group",
                    isOngoing 
                      ? "border-emerald-300 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-gray-200/80 shadow-xs hover:border-teal-300"
                  )}
                >
                  {/* Top Badge Banner */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Test #{exam.id}
                      </span>
                      {isOngoing ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          AVAILABLE NOW
                        </span>
                      ) : isUpcoming ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          UPCOMING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPLETED
                        </span>
                      )}
                    </div>

                    {/* Title & Preview */}
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
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    {/* Primary Button based on Auth Role */}
                    {isStudent ? (
                      <Link href={`/student/examinations/${exam.id}`} className="block">
                        <Button
                          className={cn(
                            "w-full rounded-xl font-bold text-xs h-10 gap-2 shadow-xs",
                            isOngoing
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white"
                          )}
                        >
                          {isOngoing ? 'Launch Test Room' : 'View Test Details'}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : isAdmin ? (
                      <Link href={`/admin/examinations/${exam.id}`} className="block">
                        <Button className="w-full rounded-xl font-bold text-xs h-10 gap-2 bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white shadow-xs">
                          Manage Examination
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => setPromptExam(exam)}
                        className={cn(
                          "w-full rounded-xl font-bold text-xs h-10 gap-2 shadow-xs",
                          isOngoing
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white"
                        )}
                      >
                        {isOngoing ? 'Attempt Examination' : 'View Test Particulars'}
                        <Lock className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Link href={`/examinations/${exam.id}`} className="block">
                      <Button variant="ghost" size="sm" className="w-full text-[11px] text-gray-500 hover:text-gray-800 h-8">
                        Public Overview & Timings
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Prompt Modal for Unauthenticated Visitors */}
      <RegisterPromptModal
        isOpen={!!promptExam}
        onClose={() => setPromptExam(null)}
        title={promptExam ? `Enroll to Attempt "${promptExam.title}"` : undefined}
        description="Online test attempts, live question rendering, and real-time score evaluations are reserved for enrolled students. Sign in or create an account to start your examination."
        itemName={promptExam?.title}
        redirectPath={promptExam ? `/student/examinations/${promptExam.id}` : '/examinations'}
      />
    </div>
  );
}

export default function PublicExaminationsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    }>
      <PublicExaminationsContent />
    </React.Suspense>
  );
}
