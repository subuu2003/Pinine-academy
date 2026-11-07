'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectPath?: string;
  itemName?: string;
}

export function RegisterPromptModal({
  isOpen,
  onClose,
  title = "Register to Unlock Complete Details",
  description = "You are currently previewing minimal information. Create a free Pinine Academy student account to unlock full official circulars, examination details, and study materials.",
  redirectPath = "",
  itemName,
}: RegisterPromptModalProps) {
  if (!isOpen) return null;

  const signUpHref = redirectPath 
    ? `/sign-up?redirect=${encodeURIComponent(redirectPath)}` 
    : '/sign-up';

  const signInHref = redirectPath 
    ? `/sign-in?redirect=${encodeURIComponent(redirectPath)}` 
    : '/sign-in';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e3a5f] via-[#0d9488] to-[#f97316]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6 pt-2">
          {/* Header Badge & Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0d9488] text-xs font-bold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5" />
              Student Registration Required
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight leading-snug">
              {title}
            </h3>

            {itemName && (
              <p className="text-xs font-semibold text-[#0d9488] mt-1 truncate">
                Item: {itemName}
              </p>
            )}

            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Value Highlights */}
          <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-2.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              What registered students unlock:
            </span>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full official notices, exam directives & downloadable circulars</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personalized Student Dashboard with syllabus tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Upcoming mock tests, diagnostic exams & question blueprints</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link href={signUpHref} className="block">
              <Button 
                onClick={onClose}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-2xl h-12 text-sm font-bold shadow-md flex items-center justify-center gap-2 group"
              >
                <GraduationCap className="w-4 h-4" />
                Create Free Student Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-gray-500">Already have an account?</span>
              <Link 
                href={signInHref}
                onClick={onClose}
                className="text-[#1e3a5f] font-bold hover:underline flex items-center gap-1"
              >
                Sign In to Account →
              </Link>
            </div>
          </div>

          {/* Dismiss option */}
          <div className="text-center pt-1 border-t border-gray-100">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              Continue browsing minimal preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
