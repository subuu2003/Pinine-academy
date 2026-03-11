import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const jeeBooks = [
  {
    title: "JEE Mathematics",
    subtitle: "PINENE ACADEMY",
    tagline: "Contains 1111+50 books",
    color: "from-blue-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop"
  },
  {
    title: "Physics",
    subtitle: "PINENE ACADEMY",
    tagline: "Contains 1111+50 books",
    color: "from-orange-500 to-orange-700",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop"
  },
  {
    title: "Chemistry",
    subtitle: "PINENE ACADEMY",
    tagline: "Contains 1111+50 books",
    color: "from-cyan-500 to-cyan-700",
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=300&h=400&fit=crop"
  },
];

export default function JEEPrep() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">JEE Exam Prep</h2>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-3 gap-4">
            {jeeBooks.map((book, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${book.color} rounded-xl p-4 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-[3/4] flex flex-col justify-between`}
              >
                <div>
                  <p className="text-xs opacity-80">{book.subtitle}</p>
                  <h3 className="font-bold text-sm lg:text-base mt-1">{book.title}</h3>
                  <p className="text-[10px] lg:text-xs mt-1 opacity-70">{book.tagline}</p>
                </div>
                <div className="mt-auto">
                  <div className="w-full h-20 lg:h-24 bg-white/10 rounded-lg flex items-center justify-center">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg opacity-80"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">JEE Exam Prep</h3>
            <p className="text-gray-600 mb-6">
              Expert Study Guide - Advanced Study Guide
            </p>
            <Link to={createPageUrl("Books?category=JEE Prep")}>
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-3 rounded-md flex items-center gap-2">
                View All JEE Books
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}