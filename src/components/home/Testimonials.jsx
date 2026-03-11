import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonialApi } from "@/api/testimonialApi";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState(/** @type {any[]} */ ([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialApi.getTestimonials();
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          throw new Error('No testimonials found');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        const fallbackTestimonials = [
          {
            _id: '1',
            name: "Rahul Sharma",
            message: "The JEE books from Pinene Academy were instrumental in my success. The study material is top-notch and easy to understand.",
            achievement: "JEE Advanced 2024"
          },
          {
            _id: '2',
            name: "Priya Patel",
            message: "Comprehensive content and expert explanations helped me score 95% in my board exams. Highly recommended!",
            achievement: "Class 12 Topper"
          },
          {
            _id: '3',
            name: "Amit Kumar",
            message: "The practice problems and detailed solutions made complex topics simple. Best investment for my studies!",
            achievement: "NEET 2024"
          },
        ];
        setTestimonials(fallbackTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = /** @type {any} */ (testimonials[currentIndex]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1e3a5f] text-center mb-12">
          Success Stories
        </h2>
        <div className="relative bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div className="w-full lg:flex-1">
              <Quote className="w-10 h-10 text-[#0d9488]/30 mb-4 mx-auto lg:mx-0" />
              <p className="text-gray-600 text-lg mb-4 italic text-center lg:text-left">
                "{currentTestimonial.message}"
              </p>
              <p className="font-semibold text-[#1e3a5f] text-center lg:text-left">
                {currentTestimonial.name}
              </p>
              <p className="text-sm text-[#0d9488] text-center lg:text-left">
                {currentTestimonial.achievement}
              </p>
            </div>
            <button
              onClick={nextTestimonial}
              className="hidden lg:flex bg-[#0d9488] text-white rounded-full p-3 hover:bg-[#0f766e] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mt-6 lg:hidden">
            <button
              onClick={prevTestimonial}
              className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#0d9488]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}