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
  Edit, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Users,
  Award,
  Layers,
  FileQuestion,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';

interface ExaminationDetail {
  id: number;
  title: string;
  description: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  start_datetime: string;
  end_datetime: string;
  publication_status: 'DRAFT' | 'PUBLISHED';
  is_published: boolean;
  current_status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  is_available: boolean;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function AdminExaminationDetailPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params?.id;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [examination, setExamination] = useState<ExaminationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard: Admin only
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (user && !user.is_staff && user.role !== 'ADMIN') {
        toast.error('Access restricted to administrators.');
        router.push('/dashboard');
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const fetchExamination = async () => {
    if (!examId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/admin/examinations/${examId}/`);
      setExamination(res.data);
    } catch (err: any) {
      toast.error('Examination not found or inaccessible.');
      router.push('/admin/examinations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.is_staff || user?.role === 'ADMIN')) {
      fetchExamination();
    }
  }, [isAuthenticated, user, examId]);

  const handleTogglePublish = async () => {
    if (!examination) return;
    setIsActionLoading(true);
    try {
      const endpoint = examination.is_published
        ? `/admin/examinations/${examination.id}/unpublish/`
        : `/admin/examinations/${examination.id}/publish/`;
      const res = await apiClient.post(endpoint);
      toast.success(res.data?.detail || 'Publication status updated.');
      fetchExamination();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update publication status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!examination) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/admin/examinations/${examination.id}/`);
      toast.success(res.data?.detail || 'Examination removed.');
      router.push('/admin/examinations');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Cannot delete examination.');
      setIsDeleting(false);
      setShowDeleteModal(false);
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

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  if (isLoading || !examination) {
    return (
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
        <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading examination details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/admin/examinations">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exam #{examination.id}</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  examination.is_published
                    ? "bg-teal-50 text-[#0d9488] border-teal-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {examination.publication_status}
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  examination.current_status === 'ONGOING'
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : examination.current_status === 'UPCOMING'
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                )}>
                  {examination.current_status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight mt-0.5">
                {examination.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isActionLoading}
              className="rounded-xl gap-1.5 h-10 px-4 text-xs font-semibold"
            >
              {isActionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : examination.is_published ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Unpublish to Draft
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-[#0d9488]" />
                  Publish for Students
                </>
              )}
            </Button>

            <Link href={`/admin/examinations/${examination.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 h-10 px-4 text-xs font-semibold border-gray-200 text-[#1e3a5f]"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={examination.current_status === 'ONGOING'}
              className="rounded-xl gap-1.5 h-10 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
              title={examination.current_status === 'ONGOING' ? 'Cannot delete ongoing exam' : 'Delete'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Availability Status Banner */}
          <div className={cn(
            "p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4",
            examination.is_available
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : examination.current_status === 'UPCOMING'
              ? "bg-blue-50/70 border-blue-200 text-blue-900"
              : examination.current_status === 'COMPLETED'
              ? "bg-slate-50 border-slate-200 text-slate-800"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          )}>
            <div className="flex items-start gap-3.5">
              <div className={cn(
                "p-3 rounded-2xl shrink-0 mt-0.5",
                examination.is_available ? "bg-emerald-500 text-white" : "bg-white text-gray-700 shadow-2xs"
              )}>
                {examination.is_available ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {examination.is_available 
                    ? "Examination is Live & Available" 
                    : !examination.is_published 
                    ? "Examination is in Draft Mode (Unpublished)" 
                    : examination.current_status === 'UPCOMING' 
                    ? "Examination is Scheduled (Upcoming)" 
                    : "Examination has Concluded (Completed)"}
                </h3>
                <p className="text-xs mt-1 opacity-90 max-w-2xl leading-relaxed">
                  {examination.is_available 
                    ? "Published and currently inside the scheduled time window. (Note: Question-taking interface will be connected in Phase 4)."
                    : !examination.is_published 
                    ? "Draft examination is hidden from student portal. Publish when you are ready to announce this schedule."
                    : examination.current_status === 'UPCOMING'
                    ? "Students can see this test on their examination portal and prepare, but the testing interface will remain locked until the start time."
                    : "The scheduled duration has elapsed. Students can no longer start this test."}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Student Access:</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black uppercase",
                examination.is_available ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
              )}>
                {examination.is_available ? "OPEN" : "LOCKED"}
              </span>
            </div>
          </div>

          {/* Schedule & Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Schedule Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f] font-bold text-sm">
                <Calendar className="w-4 h-4 text-[#0d9488]" />
                Schedule
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Exam Date</span>
                  <span className="text-base font-bold text-gray-800">
                    {new Date(examination.exam_date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Start Time</span>
                  <span className="text-base font-bold text-gray-800">
                    {formatTime(examination.start_time)}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Duration</span>
                  <span className="text-base font-bold text-gray-800">
                    {examination.duration_minutes} Minutes ({(examination.duration_minutes / 60).toFixed(1)} Hours)
                  </span>
                </div>
              </div>
            </div>

            {/* Time Window Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f] font-bold text-sm">
                <Clock className="w-4 h-4 text-[#0d9488]" />
                Time Window (Server Synchronized)
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Start Datetime</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatDateTime(examination.start_datetime)}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">End Datetime</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatDateTime(examination.end_datetime)}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Timezone Engine</span>
                  <span className="text-xs font-medium text-[#0d9488] bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    Server UTC (Enforced Server-Side)
                  </span>
                </div>
              </div>
            </div>

            {/* Audit & Management Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f] font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                Audit & Record Info
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Configured By</span>
                  <span className="text-sm font-bold text-gray-800">{examination.created_by_name}</span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Created On</span>
                  <span className="text-xs text-gray-600 font-medium">
                    {formatDateTime(examination.created_at)}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold uppercase">Last Updated</span>
                  <span className="text-xs text-gray-600 font-medium">
                    {formatDateTime(examination.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Syllabus */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-[#1e3a5f]">Instructions & Syllabus Coverage</h3>
            {examination.description ? (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {examination.description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">No instructions or description specified for this test.</p>
            )}
          </div>

          {/* Planned Future Extensions (Phase 4, 5, 6 Placeholders) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-bold text-[#1e3a5f]">Future Module Extensions</h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Upcoming Phases Roadmap</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                  <FileQuestion className="w-4 h-4" />
                  Phase 4 • Questions
                </div>
                <h4 className="font-bold text-sm text-gray-800">Question Bank & Sets</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Question mapping, section-wise marks, negative marking, and question shuffling.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  Phase 5 • Attempts
                </div>
                <h4 className="font-bold text-sm text-gray-800">Candidate Submissions</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Live proctoring, student session timers, autosave answers, and submission integrity.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  Phase 6 • Results
                </div>
                <h4 className="font-bold text-sm text-gray-800">Rankings & Percentiles</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Automatic score evaluation, answer keys, subject percentiles, and All India rank lists.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Delete Examination</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{examination.title}"</span>?
                </p>
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  This action safely soft-deletes the examination, preserving historical references.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-semibold gap-2 shadow-sm"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
