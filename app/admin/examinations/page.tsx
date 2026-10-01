'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle,
  Loader2,
  Filter,
  Check,
  X,
  FileCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';

interface ExaminationItem {
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
}

interface StatsData {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

function AdminExaminationsContent() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [examinations, setExaminations] = useState<ExaminationItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    published: 0,
    draft: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status tab filter
  const initialStatus = searchParams.get('status') || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus.toUpperCase());
  const [publicationFilter, setPublicationFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Deletion modal state
  const [deletingExam, setDeletingExam] = useState<ExaminationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle publish state
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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

  // Synchronize filter from URL search param if changed
  useEffect(() => {
    const param = searchParams.get('status');
    if (param) {
      setStatusFilter(param.toUpperCase());
    }
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/admin/examinations/stats/');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const fetchExaminations = async () => {
    setIsLoading(true);
    try {
      let url = '/admin/examinations/?';
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (publicationFilter !== 'ALL') {
        params.append('publication_status', publicationFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      url += params.toString();
      const res = await apiClient.get(url);
      setExaminations(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (e: any) {
      toast.error('Failed to fetch examinations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.is_staff || user?.role === 'ADMIN')) {
      fetchExaminations();
      fetchStats();
    }
  }, [isAuthenticated, user, statusFilter, publicationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExaminations();
  };

  const handleTogglePublish = async (exam: ExaminationItem) => {
    setActionLoadingId(exam.id);
    try {
      const endpoint = exam.is_published
        ? `/admin/examinations/${exam.id}/unpublish/`
        : `/admin/examinations/${exam.id}/publish/`;
      const res = await apiClient.post(endpoint);
      toast.success(res.data?.detail || 'Publication status updated.');
      fetchExaminations();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update publication status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExam) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/admin/examinations/${deletingExam.id}/`);
      toast.success(res.data?.detail || 'Examination removed.');
      setDeletingExam(null);
      fetchExaminations();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Cannot delete examination.');
    } finally {
      setIsDeleting(false);
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string, isAvailable: boolean) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ONGOING / AVAILABLE
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            UPCOMING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle2 className="w-3 h-3 text-gray-500" />
            COMPLETED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Phase 3
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Examination Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Create, schedule, publish, and control online academic examinations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchExaminations(); fetchStats(); }}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f] gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Link href="/admin/examinations/create">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl shadow-sm gap-2 h-10 px-4 font-semibold">
                <Plus className="w-4 h-4" />
                Create Examination
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div 
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                statusFilter === 'ALL' ? "border-[#0d9488] ring-2 ring-[#0d9488]/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Exams</p>
              <p className="text-2xl font-black text-[#1e3a5f] mt-1">{stats.total}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Configured</p>
            </div>

            <div 
              onClick={() => setStatusFilter('UPCOMING')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                statusFilter === 'UPCOMING' ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Upcoming</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{stats.upcoming}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Scheduled ahead</p>
            </div>

            <div 
              onClick={() => setStatusFilter('ONGOING')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                statusFilter === 'ONGOING' ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ongoing / Live</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.ongoing}</p>
              <p className="text-[11px] text-emerald-500 mt-0.5">Active window</p>
            </div>

            <div 
              onClick={() => setStatusFilter('COMPLETED')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                statusFilter === 'COMPLETED' ? "border-gray-400 ring-2 ring-gray-400/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-gray-700 mt-1">{stats.completed}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Duration elapsed</p>
            </div>

            <div 
              onClick={() => setPublicationFilter('PUBLISHED')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                publicationFilter === 'PUBLISHED' ? "border-[#0d9488] ring-2 ring-[#0d9488]/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-[#0d9488] uppercase tracking-wider">Published</p>
              <p className="text-2xl font-black text-[#0d9488] mt-1">{stats.published}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Visible to students</p>
            </div>

            <div 
              onClick={() => setPublicationFilter('DRAFT')}
              className={cn(
                "p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md",
                publicationFilter === 'DRAFT' ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-100"
              )}
            >
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Drafts</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{stats.draft}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Private to admin</p>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Upcoming', value: 'UPCOMING' },
                { label: 'Ongoing', value: 'ONGOING' },
                { label: 'Completed', value: 'COMPLETED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    statusFilter === tab.value
                      ? "bg-[#1e3a5f] text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}

              <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

              {/* Publication state toggle */}
              {[
                { label: 'All Status', value: 'ALL' },
                { label: 'Published Only', value: 'PUBLISHED' },
                { label: 'Drafts Only', value: 'DRAFT' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPublicationFilter(tab.value as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    publicationFilter === tab.value
                      ? "bg-teal-50 text-[#0d9488] font-bold border border-teal-200"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 h-10 rounded-xl bg-gray-50/50 border-gray-200 text-sm focus:bg-white"
              />
            </form>
          </div>

          {/* Examinations List Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0d9488] animate-spin" />
                <p className="text-sm font-medium text-gray-500">Loading examinations...</p>
              </div>
            ) : examinations.length === 0 ? (
              <div className="py-20 text-center px-4">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No examinations found</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                  {searchQuery || statusFilter !== 'ALL' || publicationFilter !== 'ALL'
                    ? "No examinations match your selected filters. Try resetting the search or filter parameters."
                    : "Get started by scheduling your first online examination."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(searchQuery || statusFilter !== 'ALL' || publicationFilter !== 'ALL') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setPublicationFilter('ALL');
                      }}
                      className="rounded-xl"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Link href="/admin/examinations/create">
                    <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Examination
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                      <th className="py-4 px-6">Examination</th>
                      <th className="py-4 px-6">Schedule (Date & Time)</th>
                      <th className="py-4 px-6">Duration</th>
                      <th className="py-4 px-6">Publication</th>
                      <th className="py-4 px-6">Live Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {examinations.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Title and description */}
                        <td className="py-4 px-6">
                          <div className="max-w-xs sm:max-w-md">
                            <Link 
                              href={`/admin/examinations/${exam.id}`}
                              className="font-bold text-[#1e3a5f] hover:text-[#0d9488] transition-colors block text-base truncate"
                            >
                              {exam.title}
                            </Link>
                            {exam.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {exam.description}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-1">
                              Created by: <span className="text-gray-600 font-medium">{exam.created_by_name}</span>
                            </p>
                          </div>
                        </td>

                        {/* Date and Start Time */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{formatDate(exam.exam_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatTime(exam.start_time)}</span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">
                            {exam.duration_minutes} mins
                          </span>
                          <span className="text-xs text-gray-400 block">
                            ({(exam.duration_minutes / 60).toFixed(1)} hrs)
                          </span>
                        </td>

                        {/* Publication State */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            disabled={actionLoadingId === exam.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer",
                              exam.is_published
                                ? "bg-teal-50 text-[#0d9488] border border-teal-200 hover:bg-teal-100"
                                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            )}
                            title="Click to toggle publication"
                          >
                            {actionLoadingId === exam.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : exam.is_published ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {exam.publication_status}
                          </button>
                        </td>

                        {/* Current Schedule Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(exam.current_status, exam.is_available)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/examinations/${exam.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>

                            <Link href={`/admin/examinations/${exam.id}/edit`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-[#0d9488] hover:bg-gray-100 rounded-lg"
                                title="Edit Examination"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingExam(exam)}
                              disabled={exam.current_status === 'ONGOING'}
                              className={cn(
                                "h-8 w-8 p-0 rounded-lg transition-colors",
                                exam.current_status === 'ONGOING'
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              )}
                              title={
                                exam.current_status === 'ONGOING'
                                  ? "Cannot delete an ongoing examination"
                                  : "Delete Examination"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingExam && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Delete Examination</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{deletingExam.title}"</span>?
                </p>
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Notice: This action safely soft-deletes the examination, preserving historical references. Ongoing exams cannot be deleted.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeletingExam(null)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
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

export default function AdminExaminationsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    }>
      <AdminExaminationsContent />
    </React.Suspense>
  );
}
