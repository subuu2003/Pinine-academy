'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Plus, 
  Shield, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  X, 
  Loader2, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import apiClient from '@/lib/apiClient';

interface StudentRecord {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  grade?: string;
  target_exam?: string;
  school_or_college?: string;
  city?: string;
  address?: string;
  date_joined: string;
}

export default function AdminStudentsPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Student Form state
  const [newStudentData, setNewStudentData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    grade: 'Class 11',
    target_exam: 'JEE Advanced',
    school_or_college: '',
    city: '',
    role: 'STUDENT',
  });

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

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      let url = '/admin/users/?role=STUDENT';
      if (statusFilter === 'ACTIVE') url += '&is_active=true';
      if (statusFilter === 'INACTIVE') url += '&is_active=false';
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await apiClient.get(url);
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (e: any) {
      toast.error('Failed to load student directory.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.is_staff || user?.role === 'ADMIN')) {
      fetchStudents();
    }
  }, [isAuthenticated, user, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (studentId: number) => {
    try {
      const res = await apiClient.post(`/admin/users/${studentId}/toggle-status/`);
      toast.success(res.data?.detail || 'Student status updated.');
      // Refresh local list
      setStudents(students.map((s) => s.id === studentId ? { ...s, is_active: res.data.is_active } : s));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent({ ...selectedStudent, is_active: res.data.is_active });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to toggle student account status.');
    }
  };

  // Handle Edit Student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSaving(true);
    try {
      const res = await apiClient.patch(`/admin/users/${editingStudent.id}/`, editingStudent);
      toast.success('Student updated successfully.');
      setStudents(students.map((s) => s.id === editingStudent.id ? res.data : s));
      setEditingStudent(null);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to update student details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.email || !newStudentData.password) {
      toast.error('Email and password are required.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.post('/admin/users/', newStudentData);
      toast.success('New student registered successfully!');
      setStudents([res.data, ...students]);
      setShowAddModal(false);
      setNewStudentData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        grade: 'Class 11',
        target_exam: 'JEE Advanced',
        school_or_college: '',
        city: '',
        role: 'STUDENT',
      });
    } catch (e: any) {
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] as string : 'Failed to register student.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth || !isAuthenticated || (!user?.is_staff && user?.role !== 'ADMIN')) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d9488]" />
      </div>
    );
  }

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.is_active).length;
  const inactiveStudents = totalStudents - activeStudents;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-inter">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Student Account Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Phase 2: Directory, activation controls & profile inspection</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-10 px-4 flex items-center gap-2 text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Enrolled</p>
                <h3 className="text-3xl font-extrabold text-[#1e3a5f] mt-1">{totalStudents}</h3>
                <p className="text-xs text-gray-500 mt-1">Students in platform</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Students</p>
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{activeStudents}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">Can log in & access materials</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deactivated / Inactive</p>
                <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{inactiveStudents}</h3>
                <p className="text-xs text-rose-600 font-medium mt-1">Suspended from logging in</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <UserX className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Directory Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Search & Filters */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200"
                />
              </form>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
                <Button
                  size="sm"
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                  className={`rounded-lg h-9 ${statusFilter === 'ALL' ? 'bg-[#1e3a5f] text-white' : ''}`}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`rounded-lg h-9 ${statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : ''}`}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`rounded-lg h-9 ${statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white' : ''}`}
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade / Target</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingStudents ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="p-5"><div className="h-10 bg-gray-100 rounded-lg" /></td>
                      </tr>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {student.first_name?.[0]?.toUpperCase() || student.username?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {student.first_name || student.last_name ? `${student.first_name} ${student.last_name}`.trim() : student.username}
                              </p>
                              <p className="text-xs text-gray-400">@{student.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-700 font-medium">{student.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{student.phone_number || 'No phone recorded'}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                            {student.grade || 'Class 11'}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1">{student.target_exam || 'General'}</p>
                        </td>
                        <td className="p-4">
                          {student.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {new Date(student.date_joined).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Edit Student */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingStudent({ ...student })}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-[#0d9488] hover:bg-teal-50 rounded-lg"
                              title="Edit Student"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* Toggle Active / Deactivate */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(student.id)}
                              className={`h-8 w-8 p-0 rounded-lg ${
                                student.is_active 
                                  ? 'text-rose-500 hover:bg-rose-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={student.is_active ? "Deactivate Student" : "Activate Student"}
                            >
                              {student.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold">No students found matching current filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal 1: Student Details (with Examination & Order History Placeholders) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center text-2xl font-black">
                  {selectedStudent.first_name?.[0]?.toUpperCase() || selectedStudent.username?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedStudent.full_name || selectedStudent.username}
                  </h2>
                  <p className="text-xs text-gray-400">Student ID #{selectedStudent.id} • @{selectedStudent.username}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)} className="rounded-full h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Status & Contact Details */}
            <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Email Address</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Phone Number</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedStudent.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Grade / Level</p>
                <p className="text-sm font-bold text-[#0d9488] mt-0.5">{selectedStudent.grade || 'Class 11'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Target Examination</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{selectedStudent.target_exam || 'JEE Prep'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">School / Institute</p>
                <p className="text-sm text-gray-700 mt-0.5">{selectedStudent.school_or_college || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">City / Location</p>
                <p className="text-sm text-gray-700 mt-0.5">{selectedStudent.city || 'Not specified'}</p>
              </div>
            </div>

            {/* Placeholders for Phase 3: Examination History & Order History */}
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    Examination History (Phase 3)
                  </span>
                  <span className="text-xs text-gray-400">Online Tests & Diagnostics</span>
                </div>
                <p className="text-xs text-gray-500">
                  Mock examinations, chapter assessments, and scoring percentiles for {selectedStudent.full_name || selectedStudent.username} will be recorded here in Phase 3.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                    Order History (Phase 3)
                  </span>
                  <span className="text-xs text-gray-400">Book Deliveries & Invoices</span>
                </div>
                <p className="text-xs text-gray-500">
                  Publication purchases, courier tracking, and payment receipts will be recorded here in Phase 3.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(selectedStudent.id)}
                className={`rounded-xl text-xs font-bold ${
                  selectedStudent.is_active ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {selectedStudent.is_active ? "Deactivate Student Account" : "Activate Student Account"}
              </Button>
              <Button onClick={() => setSelectedStudent(null)} className="bg-gray-900 text-white rounded-xl text-xs font-bold">
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Edit Student Record</h2>
              <Button variant="ghost" size="sm" onClick={() => setEditingStudent(null)} className="rounded-full h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">First Name</Label>
                  <Input
                    value={editingStudent.first_name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Last Name</Label>
                  <Input
                    value={editingStudent.last_name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email (Read Only)</Label>
                  <Input
                    value={editingStudent.email}
                    disabled
                    className="h-10 rounded-xl bg-gray-50 text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    value={editingStudent.phone_number || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone_number: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Grade</Label>
                  <select
                    value={editingStudent.grade || 'Class 11'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl h-10 px-3 bg-white text-sm"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="JEE Prep">JEE Prep</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Exam</Label>
                  <select
                    value={editingStudent.target_exam || 'JEE Advanced'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, target_exam: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl h-10 px-3 bg-white text-sm"
                  >
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CBSE Boards">CBSE Boards</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">School</Label>
                  <Input
                    value={editingStudent.school_or_college || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, school_or_college: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    value={editingStudent.city || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, city: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setEditingStudent(null)} className="h-10 rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold h-10 rounded-xl px-6 text-xs">
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Save Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Enroll New Student</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="rounded-full h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">First Name *</Label>
                  <Input
                    required
                    value={newStudentData.first_name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, first_name: e.target.value })}
                    className="h-10 rounded-xl"
                    placeholder="e.g. Rohini"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Last Name</Label>
                  <Input
                    value={newStudentData.last_name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, last_name: e.target.value })}
                    className="h-10 rounded-xl"
                    placeholder="e.g. Das"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email *</Label>
                  <Input
                    type="email"
                    required
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                    className="h-10 rounded-xl"
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    required
                    value={newStudentData.phone_number}
                    onChange={(e) => setNewStudentData({ ...newStudentData, phone_number: e.target.value })}
                    className="h-10 rounded-xl"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Password *</Label>
                <Input
                  type="password"
                  required
                  value={newStudentData.password}
                  onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                  className="h-10 rounded-xl"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Grade</Label>
                  <select
                    value={newStudentData.grade}
                    onChange={(e) => setNewStudentData({ ...newStudentData, grade: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl h-10 px-3 bg-white text-sm"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="JEE Prep">JEE Prep</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Exam</Label>
                  <select
                    value={newStudentData.target_exam}
                    onChange={(e) => setNewStudentData({ ...newStudentData, target_exam: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl h-10 px-3 bg-white text-sm"
                  >
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CBSE Boards">CBSE Boards</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="h-10 rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#1e3a5f] hover:bg-[#152a47] text-white font-bold h-10 rounded-xl px-6 text-xs">
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Register Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

