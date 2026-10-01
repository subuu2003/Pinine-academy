'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Phone, GraduationCap, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    grade: 'Class 11',
    target_exam: 'JEE Advanced',
    school_or_college: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.phone_number || !formData.password) {
      toast.error('Please fill in all required fields (Email, Phone, Password).');
      return;
    }

    setIsLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success('Registration successful! Welcome to your Student Portal.');
      router.push('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed. Please verify your details.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0d9488] text-xs font-bold uppercase tracking-wider mb-2">
              Phase 2 • Student Onboarding
            </span>
            <h1 className="text-3xl font-extrabold text-[#1e3a5f]">Student Registration</h1>
            <p className="mt-2 text-sm text-gray-500">Create your academic profile to access textbooks, exams & resources</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-semibold">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="e.g. Aarav"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-semibold">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="e.g. Patel"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-semibold">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    Current Grade / Standard *
                  </Label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm focus:ring-2 focus:ring-[#0d9488] outline-none"
                    required
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
                    Target Exam *
                  </Label>
                  <select
                    id="target_exam"
                    value={formData.target_exam}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm focus:ring-2 focus:ring-[#0d9488] outline-none"
                    required
                  >
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET (Medical)</option>
                    <option value="CBSE Boards">CBSE Board Distinction</option>
                    <option value="Foundation">Olympiad & Foundation</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school_or_college" className="text-sm font-semibold">School / Institute</Label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="school_or_college"
                    type="text"
                    placeholder="e.g. Delhi Public School"
                    value={formData.school_or_college}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="pl-10 h-11 rounded-xl"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl shadow-md transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Student Profile...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already enrolled with Pinene Academy?{' '}
            <Link href="/sign-in" className="font-bold text-[#0d9488] hover:underline">
              Student Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
