'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  message: string;
  achievement: string;
  rating?: number;
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    message: "The JEE books from Pinene Academy were instrumental in my preparation. The problem sets and theory are exceptionally clear and exam-oriented.",
    achievement: "JEE Advanced Top 500 Ranker",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    message: "Comprehensive concept breakdowns and stepwise solutions helped me score 96% in my Class 12 board examinations. Highly recommended for every serious student!",
    achievement: "Class 12 State Topper",
    rating: 5,
  },
  {
    id: 3,
    name: "Amit Kumar",
    message: "The practice problems and detailed step-by-step solutions made organic chemistry and calculus intuitive. The best investment for my academic preparation.",
    achievement: "NEET & Board Distinction",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await apiClient.get('/testimonials?approved=true');
        if (res.data?.data && res.data.data.length > 0) {
          setTestimonials(res.data.data);
        }
      } catch (e) {
        // Fallback gracefully to default curated testimonials
      }
    };
    fetchTestimonials();
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1e3a5f]">What Our Students Say</h2>
          <p className="text-gray-600 mt-2">Real feedback from students and educators across the country</p>
        </div>

        <div className="relative bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0d9488] flex items-center justify-center mb-6">
            <Quote className="w-7 h-7" />
          </div>

          <div className="flex gap-1 text-amber-400 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>

          <blockquote className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed max-w-2xl mb-8">
            &ldquo;{current.message}&rdquo;
          </blockquote>

          <div>
            <p className="font-bold text-lg text-gray-900">{current.name}</p>
            <p className="text-sm font-medium text-[#0d9488] mt-0.5">{current.achievement}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-[#0d9488]' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

