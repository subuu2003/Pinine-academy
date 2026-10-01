'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deactivatedError, setDeactivatedError] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter your email or phone number and password.');
      return;
    }

    setIsLoading(true);
    setDeactivatedError(false);

    const result = await login(identifier, password);

    if (result.success) {
      toast.success('Successfully logged in!');
      if (result.user?.is_staff || result.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      if (result.inactive) {
        setDeactivatedError(true);
      }
      toast.error(result.message || 'Login failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0d9488] text-xs font-bold uppercase tracking-wider mb-2">
              Phase 2 • Student & Staff Login
            </span>
            <h1 className="text-3xl font-extrabold text-[#1e3a5f]">Sign In</h1>
            <p className="mt-2 text-sm text-gray-500">Access your academic profile, dashboard & textbooks</p>
          </div>

          {deactivatedError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Deactivated</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Your student account is currently inactive. Please contact your institution administrator or support to reactivate access.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-semibold">
                Email Address or Phone Number *
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="e.g. student@example.com or 9876543210"
                  className="pl-10 h-11 rounded-xl"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400">You can use either your registered email or phone number</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
                <Link href="/contact" className="text-xs font-medium text-teal-600 hover:underline">
                  Need Help?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl shadow-md transition-all mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-[#0d9488] hover:underline">
              Student Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
