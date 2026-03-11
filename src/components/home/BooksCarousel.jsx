import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const topSellingBooks = [
  {
    title: "Mastering Physics",
    subtitle: "Elements (111+50) books",
    color: "from-blue-600 to-blue-800",
    image: "/books/physics.jpeg"
  },
  {
    title: "Chemistry",
    subtitle: "Contains 1111+50 books",
    color: "from-orange-500 to-red-600",
    image: "/books/chemistry.jpeg"
  },
  {
    title: "Maths Explorer",
    subtitle: "Element 11111111 | Books",
    color: "from-green-500 to-green-700",
    image: "/books/math.jpeg"
  },
  {
    title: "Ace Biology",
    subtitle: "Contains 1111+50 Books",
    color: "from-purple-500 to-purple-700",
    image: "/books/biology.jpeg"
  },
];

export default function BooksCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % topSellingBooks.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + topSellingBooks.length) % topSellingBooks.length);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">Top Selling Books</h2>
        <div className="relative">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors -ml-4"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 overflow-hidden">
            {topSellingBooks.map((book, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${book.color} rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl`}
              >
                <div className="p-4 text-white">
                  <p className="text-xs opacity-80">PINENE ACADEMY</p>
                  <h3 className="font-bold text-lg mt-1">{book.title}</h3>
                  <p className="text-xs mt-1 opacity-70">{book.subtitle}</p>
                </div>
                <div className="h-48 lg:h-56 relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <Link to={createPageUrl("Books")}>
                    <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm px-4 py-2 rounded-md flex items-center gap-1">
                      Shop Now
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors -mr-4"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
}