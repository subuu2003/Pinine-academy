'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Star, BookOpen } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { cn } from '@/lib/utils';

interface Book {
  id: number;
  title: string;
  subject: string;
  category: string;
  price: number;
  image_url: string;
  is_bestseller?: boolean;
}

const categories = ["All", "Class 9", "Class 10", "Class 11", "Class 12", "JEE Prep"];
const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];

const sampleBooks: Book[] = [
  {
    id: 1,
    title: "Mastering Physics",
    subject: "Physics",
    category: "Class 11",
    price: 599,
    image_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop",
    is_bestseller: true
  },
  {
    id: 2,
    title: "Chemistry Essentials",
    subject: "Chemistry",
    category: "Class 12",
    price: 649,
    image_url: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=300&h=400&fit=crop",
    is_bestseller: true
  },
  {
    id: 3,
    title: "Mathematics Explorer",
    subject: "Mathematics",
    category: "Class 10",
    price: 549,
    image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop",
    is_bestseller: false
  },
  {
    id: 4,
    title: "Ace Biology",
    subject: "Biology",
    category: "Class 11",
    price: 579,
    image_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=300&h=400&fit=crop",
    is_bestseller: true
  },
  {
    id: 5,
    title: "JEE Advanced Mathematics",
    subject: "Mathematics",
    category: "JEE Prep",
    price: 899,
    image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=400&fit=crop",
    is_bestseller: true
  },
  {
    id: 6,
    title: "JEE Mechanics & Optics Physics",
    subject: "Physics",
    category: "JEE Prep",
    price: 899,
    image_url: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=300&h=400&fit=crop",
    is_bestseller: false
  },
  {
    id: 7,
    title: "Class 9 Integrated Science",
    subject: "Physics",
    category: "Class 9",
    price: 449,
    image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=400&fit=crop",
    is_bestseller: false
  },
  {
    id: 8,
    title: "JEE Organic Chemistry Guide",
    subject: "Chemistry",
    category: "JEE Prep",
    price: 799,
    image_url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=300&h=400&fit=crop",
    is_bestseller: true
  }
];

function BooksContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [books, setBooks] = useState<Book[]>(sampleBooks);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await apiClient.get('/books');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setBooks(res.data.data);
        }
      } catch (err) {
        // Keeps default fallback books if backend not reachable
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSubject = selectedSubject === 'All' || book.subject === selectedSubject;
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const getGradient = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'from-blue-600 to-blue-800';
      case 'Chemistry': return 'from-orange-500 to-red-600';
      case 'Mathematics': return 'from-green-600 to-green-800';
      case 'Biology': return 'from-purple-600 to-purple-800';
      default: return 'from-slate-600 to-slate-800';
    }
  };

  const { user, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isStudent = isAuthenticated && user?.role === 'STUDENT';

  if (isStudent) {
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
                  Academic Resources
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                  Books & Study Materials
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Official Pinene Academy textbooks and exam preparation materials.
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

          <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                    Target Prep: {user?.target_exam || 'JEE Prep'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Recommended Study Resources
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xl">
                    Textbooks, formula handbooks, and previous year solved questions matching your academic syllabus ({user?.grade || 'Class 10'}).
                  </p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by title, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-gray-50/50 rounded-xl border-gray-200"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "rounded-xl text-xs font-bold transition-all",
                        selectedCategory === cat ? "bg-[#1e3a5f] text-white hover:bg-[#152a47]" : "border-gray-200"
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
                  {subjects.map((sub) => (
                    <Button
                      key={sub}
                      variant={selectedSubject === sub ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSubject(sub)}
                      className={cn(
                        "rounded-xl text-xs font-bold transition-all",
                        selectedSubject === sub ? "bg-[#0d9488] text-white hover:bg-[#0f766e]" : "border-gray-200"
                      )}
                    >
                      {sub}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#1e3a5f]">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'Publication' : 'Publications'} Available
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className={`bg-gradient-to-br ${getGradient(book.subject)} rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative`}
                  >
                    {book.is_bestseller && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-400 text-amber-950 font-bold shadow-sm">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Bestseller
                        </Badge>
                      </div>
                    )}

                    <div className="p-5 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">PINENE ACADEMY</p>
                      <h4 className="font-bold text-lg mt-1 line-clamp-1">{book.title}</h4>
                      <p className="text-xs mt-1 text-white/80">{book.category} • {book.subject}</p>
                    </div>

                    <div className="h-44 overflow-hidden bg-black/10">
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 bg-white flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-[#1e3a5f]">₹{book.price}</span>
                      </div>
                      <Link href={`/books/${book.id}`}>
                        <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-semibold">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-700">No matching books found</h3>
                  <p className="text-gray-500 text-sm mt-1">Try selecting a different grade or subject filter.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Our Publications</h1>
          <p className="text-white/80 text-lg">Explore our full curriculum of textbooks, question banks, and solution manuals</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 bg-gray-50 border-b border-gray-200 sticky top-16 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by title, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-white rounded-xl border-gray-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg ${selectedCategory === cat ? 'bg-[#1e3a5f] text-white hover:bg-[#152a47]' : 'bg-white'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
              {subjects.map((sub) => (
                <Button
                  key={sub}
                  variant={selectedSubject === sub ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSubject(sub)}
                  className={`rounded-lg ${selectedSubject === sub ? 'bg-[#0d9488] text-white hover:bg-[#0f766e]' : 'bg-white'}`}
                >
                  {sub}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Available
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-gradient-to-br ${getGradient(book.subject)} rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative`}
            >
              {book.is_bestseller && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-amber-400 text-amber-950 font-bold shadow-sm">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Bestseller
                  </Badge>
                </div>
              )}

              <div className="p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">PINENE ACADEMY</p>
                <h3 className="font-bold text-lg mt-1 line-clamp-1">{book.title}</h3>
                <p className="text-xs mt-1 text-white/80">{book.category} • {book.subject}</p>
              </div>

              <div className="h-44 overflow-hidden bg-black/10">
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-[#1e3a5f]">₹{book.price}</span>
                </div>
                <Link href={`/books/${book.id}`}>
                  <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg">
                    Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No books found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function BooksPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d9488]" />
      </div>
    }>
      <BooksContent />
    </React.Suspense>
  );
}
