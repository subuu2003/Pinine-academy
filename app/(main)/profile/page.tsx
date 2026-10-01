'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building2, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { StudentSidebar } from '@/components/student/StudentSidebar';

export default function StudentProfilePage() {
  const { user, isAuthenticated, isLoadingAuth, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    grade: '',
    target_exam: '',
    school_or_college: '',
    city: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    } else if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        grade: user.grade || 'Class 11',
        target_exam: user.target_exam || 'JEE Advanced',
        school_or_college: user.school_or_college || '',
        city: user.city || '',
        address: user.address || '',
      });
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.id]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success('Academic profile updated successfully!');
    } else {
      toast.error(result.message || 'Failed to update profile.');
    }
    setIsUpdating(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword(passwordData.old_password, passwordData.new_password);
    if (result.success) {
      toast.success('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } else {
      toast.error(result.message || 'Failed to change password. Verify your current password.');
    }
    setIsChangingPass(false);
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d9488]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Student Profile
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Academic Account & Settings
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage your enrollment credentials, grade level, and target examination goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center text-3xl font-black shadow-md flex-shrink-0">
              {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Student
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">@{user.username} • {user.email}</p>
              <p className="text-xs text-[#0d9488] font-semibold mt-0.5">
                {user.grade || 'Class 11'} • {user.target_exam || 'JEE Prep'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
            <Button
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveTab('profile')}
              className={`rounded-xl ${activeTab === 'profile' ? 'bg-[#1e3a5f] text-white hover:bg-[#152a47]' : ''}`}
            >
              Academic Profile
            </Button>
            <Button
              variant={activeTab === 'password' ? 'default' : 'outline'}
              onClick={() => setActiveTab('password')}
              className={`rounded-xl ${activeTab === 'password' ? 'bg-[#0d9488] text-white hover:bg-[#0f766e]' : ''}`}
            >
              <KeyRound className="w-4 h-4 mr-1.5" />
              Change Password
            </Button>
          </div>
        </div>

        {/* Tab 1: Profile Details & Update */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm animate-in fade-in">
            <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">Personal & Academic Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update your contact information and syllabus target</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Student
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-semibold">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-semibold">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email_read_only" className="text-sm font-semibold">Registered Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email_read_only"
                      value={user.email}
                      disabled
                      className="pl-10 h-11 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Email is unique and serves as your primary login ID</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-sm font-semibold">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Used for WhatsApp study notifications and phone login</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#0d9488]" />
                    Current Academic Level
                  </Label>
                  <select
                    id="grade"
                    value={profileData.grade}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm focus:ring-2 focus:ring-[#0d9488] outline-none"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="JEE Prep">JEE Preparation (Dropper/Repeater)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_exam" className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Target Examination
                  </Label>
                  <select
                    id="target_exam"
                    value={profileData.target_exam}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm focus:ring-2 focus:ring-[#0d9488] outline-none"
                  >
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET (Medical)</option>
                    <option value="CBSE Boards">CBSE Board Distinction</option>
                    <option value="Foundation">Olympiad & Foundation</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="school_or_college" className="text-sm font-semibold">School / Coaching Institute</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="school_or_college"
                      value={profileData.school_or_college}
                      onChange={handleProfileChange}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold">City / District</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">Shipping Address (For Book Deliveries)</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  placeholder="Complete postal address with PIN code..."
                  className="min-h-[90px] rounded-xl"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold px-8 h-11 rounded-xl shadow-md"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm animate-in fade-in max-w-2xl">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-xl font-bold text-[#1e3a5f]">Account Password & Security</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ensure your Pinene Academy student account stays protected</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="old_password" className="text-sm font-semibold">Current Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="old_password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm font-semibold">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-semibold">Confirm New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Re-type new password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPass}
                  className="bg-[#1e3a5f] hover:bg-[#152a47] text-white font-bold px-8 h-11 rounded-xl shadow-md"
                >
                  {isChangingPass && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
