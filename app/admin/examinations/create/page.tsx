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
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import apiClient from '@/lib/apiClient';

export default function CreateExaminationPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_date: '',
    start_time: '10:00',
    duration_minutes: 180,
    publication_status: 'DRAFT',
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

  // Set default exam_date to tomorrow on initial load
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, exam_date: dateStr }));
  }, []);

  // Compute live schedule preview
  const getSchedulePreview = () => {
    if (!formData.exam_date || !formData.start_time || !formData.duration_minutes) {
      return null;
    }
    try {
      const [h, m] = formData.start_time.split(':');
      const start = new Date(`${formData.exam_date}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`);
      const end = new Date(start.getTime() + Number(formData.duration_minutes) * 60000);
      const now = new Date();

      let estimatedStatus = 'UPCOMING';
      if (now < start) {
        estimatedStatus = 'UPCOMING';
      } else if (now >= start && now < end) {
        estimatedStatus = 'ONGOING';
      } else {
        estimatedStatus = 'COMPLETED';
      }

      return {
        start: start.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        end: end.toLocaleString('en-IN', { timeStyle: 'short' }),
        status: estimatedStatus,
      };
    } catch {
      return null;
    }
  };

  const schedulePreview = getSchedulePreview();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Examination title is required.';
    }
    if (!formData.exam_date) {
      newErrors.exam_date = 'Examination date is required.';
    }
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required.';
    }
    if (!formData.duration_minutes || Number(formData.duration_minutes) <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than zero minutes.';
    } else if (Number(formData.duration_minutes) > 1440) {
      newErrors.duration_minutes = 'Duration cannot exceed 1440 minutes (24 hours).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Ensure start_time has seconds if needed (HH:MM:SS)
      let timeFormatted = formData.start_time;
      if (timeFormatted.split(':').length === 2) {
        timeFormatted += ':00';
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        exam_date: formData.exam_date,
        start_time: timeFormatted,
        duration_minutes: Number(formData.duration_minutes),
        publication_status: formData.publication_status,
      };

      const res = await apiClient.post('/admin/examinations/', payload);
      toast.success(`Examination "${res.data.title}" created successfully!`);
      router.push('/admin/examinations');
    } catch (err: any) {
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const fieldErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(serverData)) {
          fieldErrors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        }
        setErrors(fieldErrors);
        toast.error(serverData.detail || 'Please correct the highlighted form errors.');
      } else {
        toast.error('Failed to create examination.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/admin/examinations">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Create Examination
              </h1>
              <p className="text-xs text-gray-500">Configure title, duration, schedule, and publication status.</p>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <BookOpen className="w-5 h-5 text-[#0d9488]" />
                <h2 className="text-lg font-bold text-[#1e3a5f]">Examination Particulars</h2>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Examination Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. JEE Advanced Full Mock Test 01 - Physics, Chemistry & Mathematics"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  className={`rounded-xl h-11 text-sm ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Instructions & Syllabus Details (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide examination syllabus coverage, marking rules (+4 for correct, -1 for incorrect), instructions for candidates..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl text-sm border-gray-200"
                />
              </div>
            </div>

            {/* Schedule & Duration Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <CalendarCheck className="w-5 h-5 text-[#0d9488]" />
                <h2 className="text-lg font-bold text-[#1e3a5f]">Schedule & Duration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Examination Date */}
                <div className="space-y-2">
                  <Label htmlFor="exam_date" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Exam Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => {
                      setFormData({ ...formData, exam_date: e.target.value });
                      if (errors.exam_date) setErrors({ ...errors, exam_date: '' });
                    }}
                    className={`rounded-xl h-11 text-sm ${errors.exam_date ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.exam_date && <p className="text-xs text-red-500 font-medium">{errors.exam_date}</p>}
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => {
                      setFormData({ ...formData, start_time: e.target.value });
                      if (errors.start_time) setErrors({ ...errors, start_time: '' });
                    }}
                    className={`rounded-xl h-11 text-sm ${errors.start_time ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.start_time && <p className="text-xs text-red-500 font-medium">{errors.start_time}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Duration (Minutes) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.duration_minutes}
                    onChange={(e) => {
                      setFormData({ ...formData, duration_minutes: Number(e.target.value) });
                      if (errors.duration_minutes) setErrors({ ...errors, duration_minutes: '' });
                    }}
                    className={`rounded-xl h-11 text-sm ${errors.duration_minutes ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  <div className="flex gap-2 pt-1">
                    {[60, 90, 120, 180].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setFormData({ ...formData, duration_minutes: mins })}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  {errors.duration_minutes && <p className="text-xs text-red-500 font-medium">{errors.duration_minutes}</p>}
                </div>
              </div>

              {/* Live Preview Box */}
              {schedulePreview && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-teal-900">
                    <Clock className="w-4 h-4 text-[#0d9488] shrink-0" />
                    <div>
                      <span className="font-bold">Schedule Window:</span>{' '}
                      <span>{schedulePreview.start}</span> to <span>{schedulePreview.end}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-teal-800 font-medium">Computed Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] bg-white border border-teal-300 text-teal-800 shadow-2xs">
                      {schedulePreview.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Publication State Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Info className="w-5 h-5 text-[#0d9488]" />
                <h2 className="text-lg font-bold text-[#1e3a5f]">Publication State</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, publication_status: 'DRAFT' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.publication_status === 'DRAFT'
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm">Save as Draft</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                      Private
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Visible only to administrators. Students will not see this examination until it is explicitly published.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, publication_status: 'PUBLISHED' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.publication_status === 'PUBLISHED'
                      ? 'border-[#0d9488] bg-teal-50/40 ring-2 ring-[#0d9488]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0d9488] text-sm">Publish Immediately</span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                      Public
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Visible to students on their portal. Students can view schedule details, but access is controlled by the scheduled time.
                  </p>
                </div>
              </div>
            </div>

            {/* General form errors if any */}
            {errors.schedule && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errors.schedule}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/examinations">
                <Button variant="outline" type="button" className="rounded-xl h-11 px-6">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-11 px-8 font-bold gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Examination...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Examination
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
