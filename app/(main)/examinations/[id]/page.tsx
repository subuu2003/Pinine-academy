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
  Sparkles,
  Lock,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { RegisterPromptModal } from '@/components/auth/RegisterPromptModal';

interface ExaminationDetail {
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

export default function PublicExaminationDetailPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params?.id;

  const [examination, setExamination] = useState<ExaminationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff);
  const isStudent = isAuthenticated && !isAdmin;

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

    fetchExamDetail();
  }, [examId]);

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

  if (isLoading || !examination) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading examination schedule...</p>
        </div>
      </div>
    );
  }

  const isOngoing = examination.current_status === 'ONGOING';
  const isUpcoming = examination.current_status === 'UPCOMING';
  const isCompleted = examination.current_status === 'COMPLETED';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/examinations" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#1e3a5f] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to All Examinations
          </Link>
          <span className="text-xs text-gray-400 font-medium">
            Examination #{examination.id}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* 1. Unauthenticated CTA Alert Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-teal-900 to-[#1e3a5f] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-teal-200">
                <Lock className="w-3.5 h-3.5" />
                Student Authentication Required
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Log In or Enroll to Attempt this Examination
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Live examination rooms, interactive question papers, countdown timers, and automated scoring are reserved for enrolled students.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href={`/sign-up?redirect=/student/examinations/${examination.id}`}>
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl px-5 h-11 text-xs sm:text-sm shadow-md">
                  Enroll / Register
                </Button>
              </Link>
              <Link href={`/sign-in?redirect=/student/examinations/${examination.id}`}>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-xl px-5 h-11 text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Authenticated Student Action Banner */}
        {isStudent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Enrolled Candidate Verified
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Ready to enter the testing hall, {user?.first_name || user?.username}?
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Launch this examination in your Student Portal with live timer and test instructions.
                </p>
              </div>
            </div>

            <Link href={`/student/examinations/${examination.id}`} className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 px-6 text-xs sm:text-sm shadow-xs flex items-center gap-2">
                Enter Test Room
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* 3. Authenticated Admin Action Banner */}
        {isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Administrator Console
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Manage Examination Details & Question Bank
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Edit timing, adjust duration, update syllabus, or monitor candidate submissions.
                </p>
              </div>
            </div>

            <Link href={`/admin/examinations/${examination.id}/edit`} className="shrink-0">
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Edit Examination
              </Button>
            </Link>
          </div>
        )}

        {/* Main Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
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

            {!isAuthenticated && (
              <Button 
                onClick={() => setIsPromptOpen(true)}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold px-5 h-10 shadow-xs"
              >
                Attempt Examination
              </Button>
            )}
          </div>

          {/* Schedule Particulars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Examination Date
              </span>
              <span className="text-base font-bold text-gray-800 mt-1 block">
                {formatDate(examination.exam_date)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Scheduled Start Time
              </span>
              <span className="text-base font-bold text-gray-800 mt-1 block">
                {formatTime(examination.start_time)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Duration Allotted
              </span>
              <span className="text-base font-bold text-[#0d9488] mt-1 block">
                {examination.duration_minutes} Minutes ({(examination.duration_minutes / 60).toFixed(1)} hrs)
              </span>
            </div>
          </div>

          {/* Precision Window Info */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                <strong className="text-gray-800">Time Window:</strong> {formatDateTime(examination.start_datetime)} to {formatDateTime(examination.end_datetime)}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Synchronized Exam Server Clock (UTC Enforced)
            </div>
          </div>

          {/* Description & Syllabus Overview */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-[#1e3a5f]">Instructions & Syllabus Coverage</h3>
            {examination.description ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {examination.description}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No specific candidate instructions attached.</p>
            )}
          </div>
        </div>
      </div>

      {/* Registration Prompt Modal */}
      <RegisterPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        title={`Enroll to Attempt "${examination.title}"`}
        description="Candidate examination attempts, answer tracking, and timed tests require an active student account. Please sign in or register to begin."
        itemName={examination.title}
        redirectPath={`/student/examinations/${examination.id}`}
      />
    </div>
  );
}
