import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Award, CheckCircle } from 'lucide-react';

const jeeBooks = [
  {
    title: "JEE Mathematics",
    subtitle: "PINENE ACADEMY",
    tagline: "Comprehensive Theory & 2000+ Problems",
    color: "from-blue-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop"
  },
  {
    title: "JEE Physics",
    subtitle: "PINENE ACADEMY",
    tagline: "Mechanics & Electrodynamics Deep Dive",
    color: "from-orange-500 to-orange-700",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop"
  },
  {
    title: "JEE Chemistry",
    subtitle: "PINENE ACADEMY",
    tagline: "Organic, Inorganic & Physical Mastery",
    color: "from-cyan-500 to-cyan-700",
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=300&h=400&fit=crop"
  },
];

export function JEEPrep() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a5f]">JEE Advanced & Main Prep</h2>
            <p className="text-gray-600 mt-1">Curated problem sets designed to build deep conceptual clarity</p>
          </div>
          <Link href="/books?category=JEE Prep" className="hidden sm:inline-flex">
            <Button variant="outline" className="text-[#0d9488] border-[#0d9488] hover:bg-[#0d9488] hover:text-white">
              View All JEE Books
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {jeeBooks.map((book, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${book.color} rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg flex flex-col justify-between overflow-hidden relative group`}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-4">
                  <Award className="w-3.5 h-3.5" />
                  {book.subtitle}
                </div>
                <h3 className="text-2xl font-bold">{book.title}</h3>
                <p className="text-white/80 text-sm mt-2">{book.tagline}</p>
              </div>

              <div className="mt-8 relative z-10 flex items-center justify-between">
                <div className="w-28 h-36 rounded-lg overflow-hidden shadow-inner border border-white/20">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <Link href="/books?category=JEE Prep">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-md">
                    Order Now
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

