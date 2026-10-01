'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  ShoppingBag,
  User,
  Award,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CalendarCheck,
  Sparkles
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recentExams, setRecentExams] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await apiClient.get('/examinations/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setRecentExams(data.slice(0, 3));
      } catch (e) {
        // Silently catch
      }
    };
    if (isAuthenticated) {
      loadExams();
    }
  }, [isAuthenticated]);

  if (isLoadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d9488]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Student Environment Sidebar */}
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Application Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Student Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Academic Dashboard
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Welcome back, {user.first_name || user.username} • Enrolled in {user.grade || 'Class 10'} ({user.target_exam || 'JEE Prep'})
            </p>
          </div>


        </header>

        {/* Dashboard Body Content */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Student Portal • Active Account
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome, {user.first_name || user.username}!
                </h2>
                <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xl">
                  Track your syllabus milestones, study materials, examination schedule, and academic orders.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/profile">
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl h-11 px-5 flex items-center gap-2 text-xs font-semibold">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/books">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-11 px-6 shadow-md flex items-center gap-2 text-xs font-semibold">
                    <BookOpen className="w-4 h-4" />
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Academic Profile Snapshot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Current Level</p>
                <h3 className="text-2xl font-bold text-[#1e3a5f] mt-1">{user.grade || 'Class 10'}</h3>
                <p className="text-xs text-gray-500 mt-1">{user.school_or_college || 'Academic Enrollee'}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Target Objective</p>
                <h3 className="text-2xl font-bold text-[#1e3a5f] mt-1">{user.target_exam || 'JEE Advanced'}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Syllabus In Progress</p>
              </div>
              <div className="p-3 bg-teal-50 text-[#0d9488] rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Status</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">Active</h3>
                <p className="text-xs text-gray-500 mt-1">Verified Member</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Support Desk</p>
                <h3 className="text-2xl font-bold text-[#1e3a5f] mt-1">Instant</h3>
                <p className="text-xs text-[#0d9488] font-medium mt-1">+91 98612 47722</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Academic Actions & Resources */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">Recommended Study Resources</h3>
                <p className="text-sm text-gray-500 mt-0.5">Recommended publications based on your selected target: {user.target_exam || 'JEE Prep'}</p>
              </div>
              <Link href={`/books?category=${encodeURIComponent(user.grade || 'Class 10')}`}>
                <Button variant="ghost" className="text-[#0d9488] font-semibold text-sm">
                  View All Matching Books
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">Physics</span>
                <h4 className="font-bold text-gray-900 mt-3">Mastering Mechanics & Waves</h4>
                <p className="text-xs text-gray-500 mt-1">Complete theory, 1,200+ solved problems with formulas.</p>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1e3a5f]">₹599</span>
                  <Link href="/books/1">
                    <Button size="sm" variant="outline" className="text-xs h-8">View</Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">Chemistry</span>
                <h4 className="font-bold text-gray-900 mt-3">Organic Reaction Mechanisms</h4>
                <p className="text-xs text-gray-500 mt-1">Stepwise mechanistic pathways, isomerism & synthesis.</p>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1e3a5f]">₹649</span>
                  <Link href="/books/2">
                    <Button size="sm" variant="outline" className="text-xs h-8">View</Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">Mathematics</span>
                <h4 className="font-bold text-gray-900 mt-3">Advanced Calculus & Coordinate Geometry</h4>
                <p className="text-xs text-gray-500 mt-1">Differential calculus, vectors, 3D and probability.</p>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1e3a5f]">₹899</span>
                  <Link href="/books/5">
                    <Button size="sm" variant="outline" className="text-xs h-8">View</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Examinations & Order History Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scheduled Examinations Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Scheduled Examinations</h3>
                      <p className="text-xs text-gray-400">Mock tests, diagnostic papers, and syllabus reviews</p>
                    </div>
                  </div>
                  <Link href="/examinations">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full hover:bg-purple-100 transition-colors">
                      View All
                    </span>
                  </Link>
                </div>

                {recentExams.length > 0 ? (
                  <div className="space-y-3 py-2">
                    {recentExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                              exam.current_status === 'ONGOING'
                                ? "bg-emerald-100 text-emerald-800"
                                : exam.current_status === 'UPCOMING'
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-200 text-gray-700"
                            )}>
                              {exam.current_status === 'ONGOING' ? 'Available Now' : exam.current_status}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {exam.exam_date}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#1e3a5f] truncate mt-1">
                            {exam.title}
                          </h4>
                        </div>
                        <Link href={`/examinations/${exam.id}`}>
                          <Button size="sm" variant="outline" className="text-xs rounded-xl h-8 px-3 shrink-0">
                            Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-700">No examination records yet</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Scheduled mock tests and online examinations will appear here as soon as they are announced.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Timezone: Synchronized with Server</span>
                <Link href="/examinations" className="text-[#0d9488] font-semibold hover:underline flex items-center gap-1">
                  Browse Examination Portal
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Order History Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 text-[#0d9488] rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Book Order History</h3>
                      <p className="text-xs text-gray-400">Tracking, shipments and invoice receipts</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-teal-50 text-[#0d9488] text-xs font-semibold rounded-full">
                    Active Catalog
                  </span>
                </div>

                <div className="py-10 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-700">No active book delivery orders</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                    Your textbook purchases and tracking details will automatically sync here upon checkout.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Express Pan-India Courier</span>
                <Link href="/books" className="text-[#0d9488] font-semibold hover:underline">
                  Order Books Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
