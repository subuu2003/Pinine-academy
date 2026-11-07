'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Printer, 
  Share2, 
  Check, 
  Loader2, 
  AlertCircle, 
  Bell, 
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Lock,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { 
  NoticeItem, 
  getCategoryBadgeClass, 
  getCategoryLabel, 
  formatNoticeDate 
} from '@/lib/notices';
import { useAuth } from '@/lib/AuthContext';
import { RegisterPromptModal } from '@/components/auth/RegisterPromptModal';

export default function PublicNoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params?.id;
  const { isAuthenticated, isLoadingAuth } = useAuth();

  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!noticeId) return;
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/notices/${noticeId}/`);
        setNotice(res.data);
      } catch (err: any) {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [noticeId]);

  // Show registration modal automatically after short delay for unauthenticated visitors
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && notice) {
      const timer = setTimeout(() => {
        setIsPromptOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoadingAuth, isAuthenticated, notice]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success('Notice link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (isNotFound || !notice) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-200/80 shadow-md space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#1e3a5f]">Notice Unavailable</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              This notice either does not exist, has expired, is currently in draft review, or has been scheduled for a future release date.
            </p>
          </div>
          <Link href="/notices" className="block pt-2">
            <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-11 text-xs font-semibold shadow-xs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Notice Board
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#1e3a5f] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/notices" className="hover:text-[#1e3a5f] transition-colors">Notice Board</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-800 font-semibold truncate max-w-[200px]">Notice #{notice.id}</span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl h-9 px-3 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Share'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl h-9 px-3 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>

            <Link href="/notices">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 px-3 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Notices
              </Button>
            </Link>
          </div>
        </div>

        {/* Official Notice Document Card */}
        <article className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden print:border-none print:shadow-none">
          {/* Institutional Top Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#244570] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/b4735fc45_IMG_20260117_094200.png" 
                alt="Pinene Academy Logo" 
                className="w-12 h-12 object-contain bg-white/10 rounded-xl p-1"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight">PINENE ACADEMY</span>
                <span className="text-xs text-teal-300 font-semibold block uppercase tracking-wider">
                  Academic Board of Administration & Examinations
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-white/80 space-y-0.5">
              <p><strong className="text-white">Ref No:</strong> PA/NOT/{notice.id}/{new Date(notice.publish_date).getFullYear()}</p>
              <p>Verified Academic Circular</p>
            </div>
          </div>

          {/* Meta Header */}
          <div className="px-6 sm:px-10 py-6 border-b border-gray-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
                getCategoryBadgeClass(notice.category)
              )}>
                {getCategoryLabel(notice.category)}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Active Circular
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
                Issued: {formatNoticeDate(notice.publish_date)}
              </span>
              {notice.expiry_date && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Valid until: {formatNoticeDate(notice.expiry_date)}
                </span>
              )}
            </div>
          </div>

          {/* Notice Body */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] tracking-tight leading-tight">
              {notice.title}
            </h1>

            {/* Summary Box */}
            {notice.short_description && (
              <div className="bg-teal-50/70 border-l-4 border-[#0d9488] p-5 rounded-r-2xl space-y-1">
                <span className="text-[11px] font-bold text-[#0d9488] uppercase tracking-wider block">
                  Executive Summary
                </span>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                  {notice.short_description}
                </p>
              </div>
            )}

            {/* Detailed Content / Registration Gate */}
            {isAuthenticated ? (
              <div className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                {notice.content}
              </div>
            ) : (
              <div className="relative py-4 space-y-6">
                {/* Blurred Content Teaser */}
                <div className="text-gray-400 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans select-none blur-xs pointer-events-none line-clamp-4">
                  {notice.content}
                </div>

                {/* Registration Lock Banner */}
                <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#1e3a5f]/5 via-teal-50/50 to-white border-2 border-dashed border-[#0d9488]/40 text-center space-y-5 shadow-xs">
                  <div className="w-14 h-14 bg-[#0d9488]/10 text-[#0d9488] rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-[#1e3a5f]">
                      Student Registration Required
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Complete circular text, official directives, instructions, and syllabus attachments are reserved for registered Pinine Academy students.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button 
                      onClick={() => setIsPromptOpen(true)}
                      className="w-full sm:w-auto bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-2xl h-11 px-7 text-xs font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Register Free Student Account
                    </Button>
                    <Link href={`/sign-in?redirect=${encodeURIComponent(`/notices/${notice.id}`)}`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto border-gray-300 text-[#1e3a5f] rounded-2xl h-11 px-6 text-xs font-semibold">
                        Sign In to View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Institutional Sign-off Block */}
            <div className="pt-10 border-t border-gray-100 mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-xs text-gray-500">
              <div className="space-y-1">
                <p className="font-bold text-gray-800 uppercase tracking-wider">Issued By Order Of</p>
                <p className="text-gray-600">Directorate of Academic Services</p>
                <p className="text-gray-400">Pinine Academy of Science & Mathematics</p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-gray-700 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />
                  Authenticated Official Copy
                </div>
                <p className="text-[10px] text-gray-400">System Timestamp: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>
        </article>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/notices">
            <Button variant="ghost" className="text-xs font-semibold text-[#0d9488] hover:text-[#0f766e]">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to Notice Board
            </Button>
          </Link>
        </div>

        {/* Registration Prompt Modal */}
        <RegisterPromptModal
          isOpen={isPromptOpen}
          onClose={() => setIsPromptOpen(false)}
          title={`Register to View "${notice.title}"`}
          itemName={notice.title}
          redirectPath={`/notices/${notice.id}`}
        />
      </div>
    </div>
  );
}
