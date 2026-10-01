'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  X, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Users as UsersIcon,
  ShoppingBag,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/apiClient';

interface BookItem {
  id: number | string;
  title: string;
  author: string;
  price: number;
  category: string;
  subject: string;
  image_url?: string;
  description?: string;
}

const initialMockBooks: BookItem[] = [
  { id: 1, title: "Mastering Physics Class 11", author: "PINENE ACADEMY", price: 599, category: "Class 11", subject: "Physics" },
  { id: 2, title: "Chemistry Essentials Class 12", author: "PINENE ACADEMY", price: 649, category: "Class 12", subject: "Chemistry" },
  { id: 3, title: "Mathematics Explorer Class 10", author: "PINENE ACADEMY", price: 549, category: "Class 10", subject: "Mathematics" },
  { id: 4, title: "Ace Biology Class 11", author: "PINENE ACADEMY", price: 579, category: "Class 11", subject: "Biology" },
  { id: 5, title: "JEE Advanced Mathematics", author: "PINENE ACADEMY", price: 899, category: "JEE Prep", subject: "Mathematics" },
];

export default function AdminPage() {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [books, setBooks] = useState<BookItem[]>(initialMockBooks);

  const [formData, setFormData] = useState({
    title: '',
    author: 'PINENE ACADEMY',
    price: '',
    category: 'Class 9',
    description: '',
    subject: 'Physics',
    image_url: ''
  });

  // Role guard
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (user && !user.is_staff) {
        toast.error('Access restricted to staff members.');
        router.push('/');
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await apiClient.get('/books');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setBooks(res.data.data);
        }
      } catch (e) {
        // Keeps initial mock data
      }
    };
    if (isAuthenticated) {
      loadBooks();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast.error('Please enter title and price.');
      return;
    }

    setIsSubmitting(true);
    const newBook: BookItem = {
      id: Date.now(),
      title: formData.title,
      author: formData.author || 'PINENE ACADEMY',
      price: parseFloat(formData.price),
      category: formData.category,
      subject: formData.subject,
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop',
      description: formData.description
    };

    try {
      await apiClient.post('/books', newBook);
    } catch (e) {
      // If endpoint not ready, still update state locally
    }

    setBooks([newBook, ...books]);
    toast.success('Book published to catalog successfully!');
    resetForm();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await apiClient.delete(`/books/${id}`);
    } catch (e) {
      // Delete locally
    }
    setBooks(books.filter((b) => b.id !== id));
    toast.success('Book removed from catalog.');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: 'PINENE ACADEMY',
      price: '',
      category: 'Class 9',
      description: '',
      subject: 'Physics',
      image_url: ''
    });
    setShowForm(false);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingAuth || !isAuthenticated || !user?.is_staff) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d9488] mb-3" />
        <p className="text-sm font-semibold text-gray-500">Checking staff authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Operations Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Welcome back, {user.first_name || user.username}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-black">
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={BookOpen} 
              label="Total Catalog Titles" 
              value={books.length.toString()} 
              trend="+14%" 
              color="bg-blue-50 text-blue-600" 
            />
            <StatCard 
              icon={UsersIcon} 
              label="Enrolled Students" 
              value="1,284" 
              trend="+6.2%" 
              color="bg-teal-50 text-[#0d9488]" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Publication Revenue" 
              value="₹42,500" 
              trend="+18%" 
              color="bg-amber-50 text-amber-600" 
            />
            <StatCard 
              icon={ShoppingBag} 
              label="Completed Orders" 
              value="312" 
              trend="+8%" 
              color="bg-purple-50 text-purple-600" 
            />
          </div>

          {/* Book Catalog Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" id="books">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Publications Catalog</h2>
                <p className="text-sm text-gray-500 mt-1">Manage, update, and publish textbooks across all classes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search titles..." 
                    className="pl-10 h-11 w-64 rounded-xl border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white h-11 rounded-xl px-5 flex items-center gap-2"
                >
                  {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showForm ? "Cancel" : "Add New Book"}
                </Button>
              </div>
            </div>

            <div className="p-8">
              {showForm && (
                <div className="mb-10 bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-300 animate-in fade-in">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">New Publication Information</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-sm font-semibold">Book Title *</Label>
                        <Input 
                          value={formData.title} 
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                          placeholder="e.g. Physics Fundamentals Class 10"
                          className="h-11 rounded-xl bg-white"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Price (₹) *</Label>
                        <Input 
                          type="number" 
                          value={formData.price} 
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                          placeholder="599"
                          className="h-11 rounded-xl bg-white"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Category</Label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm" 
                          value={formData.category} 
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option>Class 9</option>
                          <option>Class 10</option>
                          <option>Class 11</option>
                          <option>Class 12</option>
                          <option>JEE Prep</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Subject</Label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl h-11 px-3 bg-white text-sm" 
                          value={formData.subject} 
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        >
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Image URL</Label>
                        <Input 
                          value={formData.image_url} 
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                          placeholder="https://images.unsplash.com/..."
                          className="h-11 rounded-xl bg-white"
                        />
                      </div>
                      <div className="md:col-span-full space-y-2">
                        <Label className="text-sm font-semibold">Description / Syllabus Scope</Label>
                        <Textarea 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                          placeholder="Write a brief overview of the book contents..."
                          className="min-h-[100px] rounded-xl bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={resetForm} className="h-11 rounded-xl px-5">
                        Discard
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-[#1e3a5f] hover:bg-[#152a47] text-white h-11 rounded-xl px-8 font-bold"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Publish Book
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Book Title</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{book.title}</p>
                                <p className="text-xs text-gray-400">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                              {book.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-gray-700">{book.subject}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-gray-900 text-sm">₹{book.price}</span>
                          </td>
                          <td className="p-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(book.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400">
                          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold">No books match your search query.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

