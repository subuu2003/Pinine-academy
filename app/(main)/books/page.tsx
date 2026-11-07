'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronRight, 
  Star, 
  BookOpen, 
  Sparkles, 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight,
  BookMarked,
  ShoppingCart
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
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
    title: "Class 9 Integrated Science Foundation",
    subject: "Physics",
    category: "Class 9",
    price: 449,
    image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=400&fit=crop",
    is_bestseller: true
  }
];

function BooksContent() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff);
  const isStudent = isAuthenticated && !isAdmin;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await apiClient.get('/books');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setBooks(res.data.data);
        }
      } catch (err) {
        // Keeps fallback sample books if endpoint not reachable
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

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] via-[#244570] to-[#1e3a5f] text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-96 h-96 rounded-full bg-[#0d9488]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold tracking-wider uppercase text-teal-300">
            <BookMarked className="w-4 h-4 text-[#0d9488]" />
            Pinine Publications & Textbooks
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Academic Curriculum Books
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore our authoritative curriculum textbooks, comprehensive question banks, and chapter-wise solution handbooks.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* 1. Unauthenticated CTA Alert Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-teal-900 to-[#1e3a5f] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-800">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-teal-200">
                <Sparkles className="w-3.5 h-3.5" />
                Student Digital Learning Suite
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Create an Account or Login to View More
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Unlock full chapter solutions, formula handbooks, downloadable practice questions, and exclusive student textbook discounts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href="/sign-up?redirect=/books">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl px-5 h-11 text-xs sm:text-sm shadow-md">
                  Create Account / Register
                </Button>
              </Link>
              <Link href="/sign-in?redirect=/books">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-xl px-5 h-11 text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Authenticated Student Alert Banner */}
        {isStudent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Enrolled Student Portal
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Welcome, {user?.first_name || user?.username}! Access your enrolled study materials.
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  View customized textbooks and syllabus notes for {user?.grade || 'Class 10'} • {user?.target_exam || 'JEE Prep'} in your student panel.
                </p>
              </div>
            </div>

            <Link href="/student/books" className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Open Student Library
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* 3. Authenticated Admin Alert Banner */}
        {isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Administrator Session Active
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  Manage Book Publications & Pricing
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  To add new textbooks, update catalog prices, or edit publication details, visit your Admin Operations Console.
                </p>
              </div>
            </div>

            <Link href="/admin#books" className="shrink-0">
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a7a] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs">
                Admin Publications Panel
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Search & Filters Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search publications by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-2xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-xl text-xs font-bold transition-all",
                    selectedCategory === cat 
                      ? "bg-[#1e3a5f] text-white hover:bg-[#152a47]" 
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 mr-2">Subject:</span>
            {subjects.map((sub) => (
              <Button
                key={sub}
                variant={selectedSubject === sub ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "rounded-xl text-xs font-bold transition-all",
                  selectedSubject === sub 
                    ? "bg-[#0d9488] text-white hover:bg-[#0f766e]" 
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {sub}
              </Button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1e3a5f]">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'Publication' : 'Publications'} Available
            </h2>
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

                <div className="p-4 bg-white flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xl font-extrabold text-[#1e3a5f]">₹{book.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addToCart(book, 1)}
                      className="rounded-xl text-xs h-8 px-2.5 text-[#0d9488] border-[#0d9488]/40 hover:bg-teal-50"
                      title="Add to Shopping Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </Button>
                    <Link href={`/books/${book.id}`}>
                      <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-semibold h-8 px-2.5">
                        Details
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No matching books found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          )}
        </section>
      </div>
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
