import React, { useState, useEffect } from 'react';
import { booksApi } from "@/api/booksApi";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronRight, Star } from "lucide-react";
import Footer from "../components/home/Footer";

const categories = ["All", "Class 9", "Class 10", "Class 11", "Class 12", "JEE Prep"];
const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];

// Sample books data (will be replaced with actual data from database)
const sampleBooks = [
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
    title: "JEE Mathematics",
    subject: "Mathematics",
    category: "JEE Prep",
    price: 899,
    image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=400&fit=crop",
    is_bestseller: true
  },
  {
    id: 6,
    title: "JEE Physics",
    subject: "Physics",
    category: "JEE Prep",
    price: 899,
    image_url: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=300&h=400&fit=crop",
    is_bestseller: false
  },
  {
    id: 7,
    title: "Class 9 Science",
    subject: "Physics",
    category: "Class 9",
    price: 449,
    image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=400&fit=crop",
    is_bestseller: false
  },
  {
    id: 8,
    title: "Organic Chemistry",
    subject: "Chemistry",
    category: "JEE Prep",
    price: 799,
    image_url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=300&h=400&fit=crop",
    is_bestseller: true
  }
];

export default function Books() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Get initial category from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksApi.getBooks(),
    initialData: [],
  });

  const displayBooks = books.length > 0 ? books : sampleBooks;

  const filteredBooks = displayBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSubject = selectedSubject === 'All' || book.subject === selectedSubject;
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const getGradient = (/** @type {string} */ subject) => {
    switch (subject) {
      case 'Physics': return 'from-blue-600 to-blue-800';
      case 'Chemistry': return 'from-orange-500 to-red-600';
      case 'Mathematics': return 'from-green-500 to-green-700';
      case 'Biology': return 'from-purple-500 to-purple-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Our Publications</h1>
          <p className="text-white/80 text-lg">Explore our comprehensive collection of study materials</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(/** @type {any} */ e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-[#1e3a5f]' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className={selectedSubject === subject ? 'bg-[#0d9488] hover:bg-[#0f766e]' : ''}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">
              {filteredBooks.length} Books Found
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className={`bg-gradient-to-br ${getGradient(book.subject)} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105`}
              >
                {book.is_bestseller && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-yellow-400 text-yellow-900">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Bestseller
                    </Badge>
                  </div>
                )}
                <div className="p-4 text-white relative">
                  <p className="text-xs opacity-80">SANGAM PK</p>
                  <h3 className="font-bold text-lg mt-1">{book.title}</h3>
                  <p className="text-xs mt-1 opacity-70">{book.category}</p>
                </div>
                <div className="h-40 relative">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#1e3a5f]">₹{book.price}</span>
                    </div>
                    <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm">
                      Shop Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}