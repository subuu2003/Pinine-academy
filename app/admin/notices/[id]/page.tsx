'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  ExternalLink,
  User,
  Tag,
  RefreshCw,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { 
  NoticeItem, 
  getCategoryBadgeClass, 
  getCategoryLabel, 
  formatNoticeDate 
} from '@/lib/notices';

export default function AdminNoticeDetailPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noticeId = params?.id;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notice, setNotice] = useState<NoticeItem | null>(null);
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

  const fetchNotice = async () => {
    if (!noticeId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/admin/notices/${noticeId}/`);
      setNotice(res.data);
    } catch (err: any) {
      toast.error('Notice not found or inaccessible.');
      router.push('/admin/notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.is_staff || user?.role === 'ADMIN')) {
      fetchNotice();
    }
  }, [isAuthenticated, user, noticeId]);

  const handleTogglePublish = async () => {
    if (!notice) return;
    setIsActionLoading(true);
    try {
      const endpoint = notice.is_published
        ? `/admin/notices/${notice.id}/unpublish/`
        : `/admin/notices/${notice.id}/publish/`;
      const res = await apiClient.post(endpoint);
      toast.success(res.data?.detail || 'Publication status updated.');
      fetchNotice();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update publication status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!notice) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/admin/notices/${notice.id}/`);
      toast.success(res.data?.detail || 'Notice deleted.');
      router.push('/admin/notices');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Cannot delete notice.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading || !notice) {
    return (
      <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
        <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading notice details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/admin/notices">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notice #{notice.id}</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
                  getCategoryBadgeClass(notice.category)
                )}>
                  {getCategoryLabel(notice.category)}
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  notice.is_published
                    ? "bg-teal-50 text-[#0d9488] border-teal-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {notice.status}
                </span>
                {notice.effective_status && notice.effective_status !== 'DRAFT' && (
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                    notice.effective_status === 'ACTIVE'
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : notice.effective_status === 'SCHEDULED'
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  )}>
                    {notice.effective_status}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight mt-0.5 max-w-2xl truncate">
                {notice.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View on Public Page Button */}
            {notice.is_active_published && (
              <Link href={`/notices/${notice.id}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 h-10 px-3.5 text-xs font-semibold text-[#0d9488] border-teal-200 hover:bg-teal-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public
                </Button>
              </Link>
            )}

            {/* Publish / Unpublish Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isActionLoading}
              className="rounded-xl gap-1.5 h-10 px-4 text-xs font-semibold"
            >
              {isActionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : notice.is_published ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Unpublish to Draft
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-[#0d9488]" />
                  Publish Notice
                </>
              )}
            </Button>

            {/* Edit */}
            <Link href={`/admin/notices/${notice.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 h-10 px-4 text-xs font-semibold border-gray-200 text-[#1e3a5f]"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl gap-1.5 h-10 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Short Description Banner if exists */}
              {notice.short_description && (
                <div className="bg-teal-50/60 border border-teal-200/60 rounded-3xl p-6 sm:p-7 space-y-1">
                  <span className="text-[11px] font-bold text-[#0d9488] uppercase tracking-wider block">
                    Summary / Overview
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    {notice.short_description}
                  </p>
                </div>
              )}

              {/* Full Notice Content Body */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 text-[#1e3a5f]">
                    <FileText className="w-5 h-5 text-[#0d9488]" />
                    <h2 className="text-base font-bold uppercase tracking-wider">Official Announcement Content</h2>
                  </div>
                  <span className="text-xs text-gray-400">
                    Published: {formatNoticeDate(notice.publish_date)}
                  </span>
                </div>

                <div className="prose prose-slate max-w-none text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {notice.content}
                </div>
              </div>
            </div>

            {/* Sidebar Column: Metadata & Schedule Info */}
            <div className="space-y-6">
              {/* Publication Status & Schedule Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">
                    Publishing Status
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Effective Visibility</span>
                    <div className="mt-1">
                      {notice.effective_status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Visible to Public & Students
                        </span>
                      )}
                      {notice.effective_status === 'SCHEDULED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Clock className="w-3.5 h-3.5" />
                          Scheduled (Hidden until date)
                        </span>
                      )}
                      {notice.effective_status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          <Lock className="w-3.5 h-3.5" />
                          Draft (Hidden from students)
                        </span>
                      )}
                      {notice.effective_status === 'EXPIRED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Expired (Auto-Archived)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Publish Date:
                      </span>
                      <span className="font-semibold text-gray-800 text-right">
                        {formatNoticeDate(notice.publish_date)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expiry Date:
                      </span>
                      <span className="font-semibold text-gray-800 text-right">
                        {notice.expiry_date ? formatNoticeDate(notice.expiry_date) : 'No expiration set'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Category:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {getCategoryLabel(notice.category)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Author:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {notice.created_by_name || 'Admin'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-gray-400">Created At:</span>
                      <span className="text-gray-600 text-right">
                        {formatNoticeDate(notice.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200/70 text-xs space-y-3">
                <h4 className="font-bold text-gray-800">Admin Actions</h4>
                <div className="space-y-2">
                  <Link href={`/admin/notices/${notice.id}/edit`} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-xl h-9 text-xs font-medium">
                      <Edit className="w-3.5 h-3.5 mr-2" />
                      Edit Title, Dates, or Content
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePublish}
                    disabled={isActionLoading}
                    className="w-full justify-start rounded-xl h-9 text-xs font-medium"
                  >
                    {notice.is_published ? (
                      <>
                        <Lock className="w-3.5 h-3.5 mr-2 text-amber-600" />
                        Unpublish Notice
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 mr-2 text-[#0d9488]" />
                        Publish Notice Immediately
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Notice</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{notice.title}"</span>?
                  This action will remove the notice from the notice board.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
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
