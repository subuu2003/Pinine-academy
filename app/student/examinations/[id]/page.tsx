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
        toast.error('Failed to load examination details.');
        router.push('/student/examinations');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && examId) {
      fetchExamDetail();
    }
  }, [isAuthenticated, examId, router]);

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

  if (isLoading || !examination) {
    return (
      <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
        <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading examination details...</p>
          </div>
        </main>
      </div>
    );
  }

  const isOngoing = examination.current_status === 'ONGOING';
  const isUpcoming = examination.current_status === 'UPCOMING';
  const isCompleted = examination.current_status === 'COMPLETED';

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/student/examinations">
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
            <Link href="/student/examinations">
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
            <Link href="/student/examinations">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-xs text-gray-400">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link> /{' '}
              <Link href="/student/examinations" className="hover:underline">Examinations</Link> /{' '}
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
                      <Clock className="w-3 h-3 text-blue-500" />
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

              <Link href="/student/examinations">
                <Button variant="outline" className="rounded-xl text-xs font-semibold">
                  Back to All Exams
                </Button>
              </Link>
            </div>

            {/* Schedule Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  Exam Date
                </span>
                <p className="text-sm font-bold text-[#1e3a5f]">
                  {formatDate(examination.exam_date)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Start Time
                </span>
                <p className="text-sm font-bold text-[#1e3a5f]">
                  {formatTime(examination.start_time)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                <span className="text-[11px] font-bold text-[#0d9488] uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0d9488]" />
                  Total Duration
                </span>
                <p className="text-sm font-black text-[#0d9488]">
                  {examination.duration_minutes} Minutes
                </p>
              </div>
            </div>

            {/* Examination Description / Syllabus */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0d9488]" />
                Syllabus & Instructions
              </h3>
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {examination.description || "No specific syllabus notes or instructions were attached to this examination."}
              </div>
            </div>

            {/* Live Status Guidance Action Banner */}
            {isOngoing && (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-emerald-900 text-base flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Examination Hall is Open!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Your scheduled exam duration is actively running. Ensure you have a stable network before beginning.
                  </p>
                </div>
                <Button 
                  onClick={() => toast.info('Online question test player interface activates in the next evaluation phase.')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 h-11 shrink-0 shadow-md"
                >
                  Start Examination
                </Button>
              </div>
            )}

            {isUpcoming && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Scheduled Ahead</h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    This examination has not started yet. The entry window will unlock on {formatDate(examination.exam_date)} at {formatTime(examination.start_time)}.
                  </p>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Examination Concluded</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    The scheduled duration for this examination has concluded. Evaluation scoring and model solutions will be made available shortly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
