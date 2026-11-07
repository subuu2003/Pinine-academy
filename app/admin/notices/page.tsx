'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
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
  Lock, 
  Unlock, 
  RefreshCw,
  ExternalLink,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { 
  NoticeItem, 
  NOTICE_CATEGORIES, 
  getCategoryBadgeClass, 
  getCategoryLabel, 
  formatNoticeDate 
} from '@/lib/notices';

interface StatsData {
  total: number;
  published: number;
  draft: number;
  active: number;
  expired: number;
  scheduled: number;
}

function AdminNoticesContent() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    published: 0,
    draft: 0,
    active: 0,
    expired: 0,
    scheduled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Status & Category filters
  const initialStatus = searchParams.get('status') || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus.toUpperCase());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Deletion modal state
  const [deletingNotice, setDeletingNotice] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle publish loading ID
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

  useEffect(() => {
    const param = searchParams.get('status');
    if (param) {
      setStatusFilter(param.toUpperCase());
    }
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/admin/notices/stats/');
      setStats(res.data);
    } catch (e) {
      // ignore
    }
  };

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (categoryFilter !== 'ALL') {
        params.append('category', categoryFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await apiClient.get(`/admin/notices/?${params.toString()}`);
      setNotices(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (e: any) {
      toast.error('Failed to fetch notices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.is_staff || user?.role === 'ADMIN')) {
      fetchNotices();
      fetchStats();
    }
  }, [isAuthenticated, user, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleTogglePublish = async (notice: NoticeItem) => {
    setActionLoadingId(notice.id);
    try {
      const endpoint = notice.is_published
        ? `/admin/notices/${notice.id}/unpublish/`
        : `/admin/notices/${notice.id}/publish/`;
      const res = await apiClient.post(endpoint);
      toast.success(res.data?.detail || 'Notice publication status updated.');
      fetchNotices();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update publication status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotice) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/admin/notices/${deletingNotice.id}/`);
      toast.success(res.data?.detail || 'Notice removed.');
      setDeletingNotice(null);
      fetchNotices();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Cannot delete notice.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getEffectiveStatusBadge = (notice: NoticeItem) => {
    const status = notice.effective_status || (notice.is_published ? 'ACTIVE' : 'DRAFT');
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Scheduled
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Draft
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Phase 7A
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Notice Management
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish announcements, exam alerts, admission dates, and academic circulars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchNotices(); fetchStats(); }}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50 flex items-center gap-1.5"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#0d9488]")} />
              <span className="hidden sm:inline text-xs">Refresh</span>
            </Button>

            <Link href="/notices" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-gray-200 text-gray-600 hover:text-[#0d9488] hover:bg-teal-50 flex items-center gap-1.5 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Public Board</span>
              </Button>
            </Link>

            <Link href="/admin/notices/create">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl shadow-sm flex items-center gap-2 text-xs font-semibold px-4 h-9">
                <Plus className="w-4 h-4" />
                <span>Create Notice</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* KPI Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div 
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
                statusFilter === 'ALL'
                  ? "bg-white border-[#0d9488] ring-2 ring-[#0d9488]/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Notices</span>
                <Bell className="w-4 h-4 text-[#1e3a5f]" />
              </div>
              <p className="text-2xl font-black text-[#1e3a5f] mt-2">{stats.total}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('ACTIVE')}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
                statusFilter === 'ACTIVE'
                  ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Live</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">{stats.active}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('SCHEDULED')}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
                statusFilter === 'SCHEDULED'
                  ? "bg-white border-blue-500 ring-2 ring-blue-500/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-blue-600 mt-2">{stats.scheduled}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('DRAFT')}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
                statusFilter === 'DRAFT'
                  ? "bg-white border-amber-500 ring-2 ring-amber-500/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">{stats.draft}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('EXPIRED')}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1",
                statusFilter === 'EXPIRED'
                  ? "bg-white border-gray-500 ring-2 ring-gray-400/20"
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Expired</span>
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-gray-700 mt-2">{stats.expired}</p>
            </div>
          </div>

          {/* Search, Filter Bar and Status Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Keyword Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search notices by title, description, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
                />
              </form>

              {/* Category Filter & Reset */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  >
                    <option value="ALL">All Categories</option>
                    {NOTICE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {(searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs text-gray-500 hover:text-red-600 h-10 px-3"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 overflow-x-auto pb-1 text-xs">
              {[
                { key: 'ALL', label: 'All Notices' },
                { key: 'ACTIVE', label: 'Active Live' },
                { key: 'SCHEDULED', label: 'Scheduled' },
                { key: 'PUBLISHED', label: 'All Published' },
                { key: 'DRAFT', label: 'Drafts' },
                { key: 'EXPIRED', label: 'Expired' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl font-medium transition-colors shrink-0",
                    statusFilter === tab.key
                      ? "bg-[#1e3a5f] text-white shadow-xs font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notices List Section */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#0d9488] animate-spin mx-auto" />
                <p className="text-sm text-gray-500 font-medium">Loading notices...</p>
              </div>
            ) : notices.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 bg-teal-50 text-[#0d9488] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No notices found</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                  {searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'No notices match your selected filters. Try clearing filters or search term.'
                    : 'Get started by creating your first academy notice or circular.'}
                </p>
                <Link href="/admin/notices/create" className="inline-block mt-4">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-semibold px-4">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Notice
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Notice Info */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Category Badge */}
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider",
                          getCategoryBadgeClass(notice.category)
                        )}>
                          {getCategoryLabel(notice.category)}
                        </span>

                        {/* Status Badge */}
                        {getEffectiveStatusBadge(notice)}

                        {/* Publication Flag */}
                        <span className="text-xs text-gray-400">
                          {notice.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] hover:text-[#0d9488] transition-colors">
                        <Link href={`/admin/notices/${notice.id}`}>
                          {notice.title}
                        </Link>
                      </h3>

                      {notice.short_description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 max-w-3xl">
                          {notice.short_description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Publish: {formatNoticeDate(notice.publish_date)}</span>
                        </div>
                        {notice.expiry_date ? (
                          <div className={cn(
                            "flex items-center gap-1.5",
                            notice.is_expired ? "text-amber-600 font-medium" : "text-gray-500"
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Expires: {formatNoticeDate(notice.expiry_date)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No Expiration</span>
                        )}
                        <span className="text-gray-400">• Author: {notice.created_by_name || 'Admin'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      {/* Publish / Unpublish Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(notice)}
                        disabled={actionLoadingId === notice.id}
                        className={cn(
                          "rounded-xl h-9 px-3 text-xs font-semibold gap-1.5 border-gray-200",
                          notice.is_published
                            ? "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                            : "hover:bg-teal-50 hover:text-[#0d9488] hover:border-teal-200"
                        )}
                        title={notice.is_published ? "Unpublish to Draft" : "Publish Notice"}
                      >
                        {actionLoadingId === notice.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : notice.is_published ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-[#0d9488]" />
                            <span className="hidden sm:inline">Publish</span>
                          </>
                        )}
                      </Button>

                      {/* View Details */}
                      <Link href={`/admin/notices/${notice.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl h-9 px-3 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </Link>

                      {/* Edit */}
                      <Link href={`/admin/notices/${notice.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl h-9 px-3 text-xs font-semibold border-gray-200 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 flex items-center gap-1.5"
                          title="Edit Notice"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingNotice(notice)}
                        className="rounded-xl h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingNotice && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Notice?</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to remove <span className="font-semibold text-gray-800">"{deletingNotice.title}"</span>?
                  This notice will be withdrawn from the academy notice board.
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl text-xs text-gray-600 space-y-1">
                <p><strong className="text-gray-700">Category:</strong> {getCategoryLabel(deletingNotice.category)}</p>
                <p><strong className="text-gray-700">Status:</strong> {deletingNotice.is_published ? 'Published' : 'Draft'}</p>
                <p><strong className="text-gray-700">Publish Date:</strong> {formatNoticeDate(deletingNotice.publish_date)}</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingNotice(null)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl h-11 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 text-xs font-semibold gap-1.5"
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

export default function AdminNoticesPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    }>
      <AdminNoticesContent />
    </React.Suspense>
  );
}
