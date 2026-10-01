'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Layers, 
  Info,
  Lock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { StudentSidebar } from '@/components/student/StudentSidebar';

interface StudentExamDetail {
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

export default function StudentExaminationDetailPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params?.id;

  const [examination, setExamination] = useState<StudentExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    const fetchExamDetail = async () => {
      if (!examId) return;
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/examinations/${examId}/`);
        setExamination(res.data);
      } catch (err: any) {
        toast.error('Examination not found or unpublished.');
        router.push('/examinations');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchExamDetail();
    }
  }, [isAuthenticated, examId]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
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

  const formatDateTime = (dtStr: string) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dtStr;
    }
  };

  if (isLoadingAuth || isLoading || !examination) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading examination details...</p>
        </div>
      </div>
    );
  }

  const isOngoing = examination.current_status === 'ONGOING';
  const isUpcoming = examination.current_status === 'UPCOMING';
  const isCompleted = examination.current_status === 'COMPLETED';

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/examinations">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                  Exam Details
                </span>
                <span className="text-xs text-gray-400 font-semibold">Test ID: #{examination.id}</span>
              </div>
              <h1 className="text-lg font-black text-[#1e3a5f] tracking-tight truncate max-w-md">
                {examination.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/examinations">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                All Exams
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/examinations">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-xs text-gray-400">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link> /{' '}
            <Link href="/examinations" className="hover:underline">Examinations</Link> /{' '}
            <span className="text-gray-700 font-medium">Exam #{examination.id}</span>
          </div>
        </div>

        {/* Main Status Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Test ID: #{examination.id}
                </span>
                {isOngoing ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE / AVAILABLE NOW
                  </span>
                ) : isUpcoming ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <Clock className="w-3 h-3" />
                    UPCOMING SCHEDULE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    <CheckCircle2 className="w-3 h-3" />
                    EXAMINATION COMPLETED
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] tracking-tight">
                {examination.title}
              </h1>
            </div>

            <Link href="/examinations">
              <Button variant="outline" className="rounded-xl text-xs font-semibold">
                Back to All Exams
              </Button>
            </Link>
          </div>

          {/* Phase 3 Notice Banner */}
          <div className={cn(
            "p-5 rounded-2xl border flex items-start gap-3.5",
            isOngoing 
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : isUpcoming 
              ? "bg-blue-50/80 border-blue-200 text-blue-900"
              : "bg-gray-50 border-gray-200 text-gray-800"
          )}>
            <div className="p-2 bg-white rounded-xl shadow-2xs mt-0.5 shrink-0">
              <Sparkles className={cn(
                "w-5 h-5",
                isOngoing ? "text-emerald-600" : isUpcoming ? "text-blue-600" : "text-gray-500"
              )} />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">
                {isOngoing 
                  ? "Scheduled Test Window is Currently Open" 
                  : isUpcoming 
                  ? "Upcoming Test Schedule Confirmed" 
                  : "Examination Schedule Concluded"}
              </p>
              <p className="opacity-90 leading-relaxed">
                {isOngoing 
                  ? "This examination is live in the schedule. Under Phase 3 (Examination Management), scheduling and availability verification are fully active. Interactive question rendering and answer recording will activate in the next development phase (Question Bank & Examination Attempts)."
                  : isUpcoming 
                  ? `Please review your syllabus and be ready on ${formatDate(examination.exam_date)} at ${formatTime(examination.start_time)}. The test window is locked until the configured start time.`
                  : `The allotted time for this examination has ended (${formatDateTime(examination.end_datetime)}). Results and answer review will be connected in future modules.`}
              </p>
            </div>
          </div>

          {/* Schedule Particulars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Examination Date
              </span>
              <span className="text-base font-bold text-gray-800 mt-1 block">
                {formatDate(examination.exam_date)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Scheduled Start Time
              </span>
              <span className="text-base font-bold text-gray-800 mt-1 block">
                {formatTime(examination.start_time)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Duration Allotted
              </span>
              <span className="text-base font-bold text-[#0d9488] mt-1 block">
                {examination.duration_minutes} Minutes ({(examination.duration_minutes / 60).toFixed(1)} hrs)
              </span>
            </div>
          </div>

          {/* Server Time & Window Precision */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                <strong className="text-gray-700">Authoritative Schedule:</strong> {formatDateTime(examination.start_datetime)} to {formatDateTime(examination.end_datetime)}
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Server Time Synchronized (UTC Enforced)
            </div>
          </div>

          {/* Description & Syllabus */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-[#1e3a5f]">Instructions & Guidelines</h3>
            {examination.description ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {examination.description}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No specific candidate instructions attached.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
