'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const topSellingBooks = [
  {
    id: 1,
    title: "Mastering Physics",
    subtitle: "Class 11 Mechanics & Waves",
    color: "from-blue-600 to-blue-800",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop",
    price: "₹599"
  },
  {
    id: 2,
    title: "Chemistry Essentials",
    subtitle: "Class 12 Organic & Inorganic",
    color: "from-orange-500 to-red-600",
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=300&h=400&fit=crop",
    price: "₹649"
  },
  {
    id: 3,
    title: "Mathematics Explorer",
    subtitle: "Class 10 Geometry & Algebra",
    color: "from-green-600 to-green-800",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop",
    price: "₹549"
  },
  {
    id: 4,
    title: "Ace Biology",
    subtitle: "Class 11 Cell Biology & Botany",
    color: "from-purple-600 to-purple-800",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=300&h=400&fit=crop",
    price: "₹579"
  },
];

export function BooksCarousel() {
  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % topSellingBooks.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + topSellingBooks.length) % topSellingBooks.length);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a5f]">Top Selling Publications</h2>
            <p className="text-gray-500 mt-1">Recommended by top tutors and school toppers nationwide</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-2.5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-2.5 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topSellingBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-gradient-to-br ${book.color} rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group`}
            >
              <div className="p-5 text-white">
                <p className="text-xs font-semibold tracking-wider uppercase opacity-80">PINENE ACADEMY</p>
                <h3 className="font-bold text-xl mt-1 line-clamp-1">{book.title}</h3>
                <p className="text-xs mt-1 text-white/80">{book.subtitle}</p>
              </div>
              <div className="h-48 overflow-hidden bg-black/10">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <span className="text-xl font-bold text-[#1e3a5f]">{book.price}</span>
                <Link href={`/books/${book.id}`}>
                  <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

