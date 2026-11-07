'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Clock, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { 
  NOTICE_CATEGORIES, 
  NoticeCategory, 
  NoticeStatus, 
  getCategoryBadgeClass, 
  getCategoryLabel 
} from '@/lib/notices';

export default function CreateNoticePage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    short_description: string;
    content: string;
    category: NoticeCategory;
    publish_date: string;
    expiry_date: string;
    status: NoticeStatus;
  }>({
    title: '',
    short_description: '',
    content: '',
    category: 'GENERAL',
    publish_date: '',
    expiry_date: '',
    status: 'DRAFT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Set default publish_date to current local datetime
  useEffect(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localNowStr = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFormData((prev) => ({
      ...prev,
      publish_date: prev.publish_date || localNowStr,
    }));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a valid notice category.';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Notice content is required.';
    }

    if (!formData.publish_date) {
      newErrors.publish_date = 'Publish date is required.';
    }

    if (formData.publish_date && formData.expiry_date) {
      const pub = new Date(formData.publish_date).getTime();
      const exp = new Date(formData.expiry_date).getTime();
      if (exp <= pub) {
        newErrors.expiry_date = 'Expiry date must be strictly after the publish date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        short_description: formData.short_description.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
        is_published: formData.status === 'PUBLISHED',
        publish_date: new Date(formData.publish_date).toISOString(),
      };

      if (formData.expiry_date) {
        payload.expiry_date = new Date(formData.expiry_date).toISOString();
      } else {
        payload.expiry_date = null;
      }

      const res = await apiClient.post('/admin/notices/', payload);
      toast.success(
        formData.status === 'PUBLISHED'
          ? 'Notice created and published successfully!'
          : 'Notice saved as draft successfully!'
      );
      router.push(`/admin/notices/${res.data.id}`);
    } catch (err: any) {
      const serverErrors = err.response?.data;
      if (typeof serverErrors === 'object' && serverErrors !== null) {
        const mappedErrors: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, val]) => {
          mappedErrors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setErrors(mappedErrors);
        toast.error('Failed to create notice. Check highlighted fields.');
      } else {
        toast.error(err.response?.data?.detail || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center gap-3">
            <Link href="/admin/notices">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notice Board</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                <span className="text-xs font-bold text-[#0d9488]">New Announcement</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight mt-0.5">
                Create Notice
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/admin/notices">
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 text-xs font-semibold border-gray-200">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-10 px-5 text-xs font-semibold shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {formData.status === 'PUBLISHED' ? 'Publish Notice' : 'Save as Draft'}
            </Button>
          </div>
        </header>

        {/* Content Grid: Form + Live Preview */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Notice Details Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-[#1e3a5f]">Notice Details</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Specify announcement title, category, and main text body.</p>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Notice Title <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-[11px] text-gray-400">{formData.title.length} / 255</span>
                  </div>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g. Annual Scholarship & Science Olympiad 2026 Announcement"
                    value={formData.title}
                    maxLength={255}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    className={cn(
                      "rounded-xl h-11 text-sm bg-gray-50/50 border-gray-200 focus:bg-white",
                      errors.title && "border-red-400 bg-red-50/20"
                    )}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Category & Status Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      {NOTICE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Initial Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Publication Status <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as NoticeStatus })}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                    >
                      <option value="DRAFT">Draft (Save privately)</option>
                      <option value="PUBLISHED">Published (Make visible according to schedule)</option>
                    </select>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="short_description" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Short Description / Summary
                    </Label>
                    <span className="text-[11px] text-gray-400">{formData.short_description.length} / 500</span>
                  </div>
                  <Textarea
                    id="short_description"
                    rows={2}
                    placeholder="Brief 1-2 sentence overview shown in notice listing cards..."
                    value={formData.short_description}
                    maxLength={500}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="rounded-xl text-sm bg-gray-50/50 border-gray-200 focus:bg-white resize-none"
                  />
                  <p className="text-[11px] text-gray-400">
                    Provides students with a quick summary on dashboard and notice cards.
                  </p>
                </div>

                {/* Detailed Content */}
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Notice Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    rows={8}
                    placeholder="Type the full official notice content, circular directives, instructions, contact details, or exam guidelines..."
                    value={formData.content}
                    onChange={(e) => {
                      setFormData({ ...formData, content: e.target.value });
                      if (errors.content) setErrors({ ...errors, content: '' });
                    }}
                    className={cn(
                      "rounded-xl text-sm bg-gray-50/50 border-gray-200 focus:bg-white font-sans leading-relaxed",
                      errors.content && "border-red-400 bg-red-50/20"
                    )}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Schedule & Timing Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-[#1e3a5f]">Publishing Schedule & Expiry</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Control when notice becomes active and when it automatically archives.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Publish Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="publish_date" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Publish Date & Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="publish_date"
                      type="datetime-local"
                      value={formData.publish_date}
                      onChange={(e) => {
                        setFormData({ ...formData, publish_date: e.target.value });
                        if (errors.publish_date) setErrors({ ...errors, publish_date: '' });
                      }}
                      className={cn(
                        "rounded-xl h-11 text-sm bg-gray-50/50 border-gray-200 focus:bg-white",
                        errors.publish_date && "border-red-400 bg-red-50/20"
                      )}
                    />
                    <p className="text-[11px] text-gray-400">
                      Notices with future publish dates will be marked as "Scheduled" and hidden from public view until that time.
                    </p>
                    {errors.publish_date && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.publish_date}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiry_date" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Expiry Date & Time (Optional)
                      </Label>
                      {formData.expiry_date && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, expiry_date: '' })}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <Input
                      id="expiry_date"
                      type="datetime-local"
                      value={formData.expiry_date}
                      onChange={(e) => {
                        setFormData({ ...formData, expiry_date: e.target.value });
                        if (errors.expiry_date) setErrors({ ...errors, expiry_date: '' });
                      }}
                      className={cn(
                        "rounded-xl h-11 text-sm bg-gray-50/50 border-gray-200 focus:bg-white",
                        errors.expiry_date && "border-red-400 bg-red-50/20"
                      )}
                    />
                    <p className="text-[11px] text-gray-400">
                      When expired, the notice will automatically be hidden from public and student portals.
                    </p>
                    {errors.expiry_date && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.expiry_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Live Preview & Guidelines */}
            <div className="space-y-6">
              {/* Live Preview Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-[#1e3a5f]">
                    <Eye className="w-4 h-4 text-[#0d9488]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Card Preview</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Student View
                  </span>
                </div>

                {/* Simulated Notice Card */}
                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-gray-200/60 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                      getCategoryBadgeClass(formData.category)
                    )}>
                      {getCategoryLabel(formData.category)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formData.publish_date ? new Date(formData.publish_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Today'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#1e3a5f] leading-snug">
                    {formData.title || 'Untitled Notice Title Preview'}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {formData.short_description || formData.content || 'Notice summary and description preview will render here...'}
                  </p>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-[#0d9488] font-semibold">
                    <span>Read Full Notice →</span>
                    {formData.status === 'DRAFT' && (
                      <span className="text-amber-600 font-bold text-[10px]">[DRAFT]</span>
                    )}
                  </div>
                </div>

                {/* Information Card */}
                <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 text-xs text-teal-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0d9488]">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Publishing Workflow</span>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    Drafts remain hidden until published. Once published, notices display on the public board, student dashboard, and circular lists during their valid date window.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
