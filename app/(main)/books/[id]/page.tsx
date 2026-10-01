'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, ShoppingCart, Star, ShieldCheck, Truck, BookOpen } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface Book {
  id: number | string;
  title: string;
  subject: string;
  category: string;
  price: number;
  image_url: string;
  description?: string;
  author?: string;
  is_bestseller?: boolean;
}

const sampleCatalog: Record<string, Book> = {
  "1": {
    id: 1,
    title: "Mastering Physics Class 11",
    subject: "Physics",
    category: "Class 11",
    price: 599,
    author: "PINENE ACADEMY ACADEMIC COUNCIL",
    description: "A comprehensive guide designed for Class 11 CBSE and competitive foundations. Includes deep conceptual analysis, kinematics, laws of motion, gravitation, thermodynamics, and over 1,200 graded practice exercises with detailed explanations.",
    image_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=800&fit=crop",
    is_bestseller: true
  },
  "2": {
    id: 2,
    title: "Chemistry Essentials Class 12",
    subject: "Chemistry",
    category: "Class 12",
    price: 649,
    author: "PINENE ACADEMY ACADEMIC COUNCIL",
    description: "Complete organic mechanisms, coordination chemistry, and chemical kinetics. Formulated to ensure total syllabus coverage for board exam distinction and competitive exams.",
    image_url: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&h=800&fit=crop",
    is_bestseller: true
  },
  "3": {
    id: 3,
    title: "Mathematics Explorer Class 10",
    subject: "Mathematics",
    category: "Class 10",
    price: 549,
    author: "PINENE ACADEMY ACADEMIC COUNCIL",
    description: "Step-by-step proofs, trigonometry, surface areas, and quadratic equations. Features board exam solved papers from the last 10 years.",
    image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=800&fit=crop",
    is_bestseller: false
  },
  "4": {
    id: 4,
    title: "Ace Biology Class 11",
    subject: "Biology",
    category: "Class 11",
    price: 579,
    author: "PINENE ACADEMY ACADEMIC COUNCIL",
    description: "Cell structure, human physiology, plant morphology, and genetics with high-resolution anatomical diagrams and mnemonic charts.",
    image_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=800&fit=crop",
    is_bestseller: true
  },
  "5": {
    id: 5,
    title: "JEE Advanced Mathematics",
    subject: "Mathematics",
    category: "JEE Prep",
    price: 899,
    author: "PINENE ACADEMY ACADEMIC COUNCIL",
    description: "Advanced calculus, vectors, 3D geometry, complex numbers, and probability. Contains multiple-choice, numerical-value, and matrix-match problems curated for IIT JEE Advanced.",
    image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=800&fit=crop",
    is_bestseller: true
  },
};

export default function BookDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await apiClient.get(`/books/${id}`);
        if (res.data?.data) {
          setBook(res.data.data);
        } else if (id && sampleCatalog[id]) {
          setBook(sampleCatalog[id]);
        }
      } catch (err) {
        if (id && sampleCatalog[id]) {
          setBook(sampleCatalog[id]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]" />
      </div>
    );
  }

  const currentBook = book || (id ? sampleCatalog[id] : null) || {
    id: id || "unknown",
    title: `Publication #${id}`,
    subject: "Academic Material",
    category: "General",
    price: 599,
    author: "PINENE ACADEMY",
    description: "Comprehensive textbook and study materials aligned with current academic benchmarks.",
    image_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=800&fit=crop"
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/books" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1e3a5f] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to All Publications
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-8 sm:p-12">
            {/* Book Cover Image */}
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative">
                <img
                  src={currentBook.image_url}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
                {currentBook.is_bestseller && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-400 text-amber-950 font-bold px-3 py-1 text-sm shadow-md">
                      <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                      Bestseller
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200">
                    {currentBook.category}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                    {currentBook.subject}
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] tracking-tight">
                  {currentBook.title}
                </h1>
                <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wide">
                  By {currentBook.author || 'PINENE ACADEMY'}
                </p>

                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#1e3a5f]">₹{currentBook.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{Number(currentBook.price) + 200}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Save ₹200
                  </span>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Book Overview</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {currentBook.description}
                  </p>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Includes complete chapter-wise formula sheet & quick notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>1,000+ curated problems with fully verified solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Aligned with 2024-2025 CBSE and JEE Advanced syllabus</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                <Link href={`https://wa.me/9861247722?text=Hello%20Pinene%20Academy,%20I%20would%20like%20to%20order%20the%20book:%20${encodeURIComponent(currentBook.title)}%20(ID:%20${currentBook.id})`} target="_blank" className="flex-1">
                  <Button className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Order via WhatsApp
                  </Button>
                </Link>
                <Link href="/contact" className="sm:w-auto">
                  <Button variant="outline" className="w-full h-12 rounded-xl text-gray-700 font-semibold px-6">
                    Inquire Copies
                  </Button>
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>100% Genuine Pinene Publication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Express Pan-India Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

