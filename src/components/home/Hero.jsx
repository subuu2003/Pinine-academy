import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const publications = [
  { class: "9", color: "from-blue-500 to-blue-600" },
  { class: "10", color: "from-orange-400 to-orange-500" },
  { class: "11", color: "from-green-600 to-green-700" },
  { class: "12", color: "from-red-500 to-red-600" },
];

export default function Hero() {
  return (
    <section 
      className="relative bg-white overflow-hidden"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/625e3ef95_hero-student.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center  -60px',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              <span className="text-[#1e3a5f]">Empowering</span>{" "}
              <span className="text-[#0d9488]">Student Success</span>
            </h1>
            <p className="text-xl text-gray-700">
              Books & Study Materials for Classes 9<sup>th</sup> to 12<sup>th</sup> & JEE
            </p>
            <p className="text-gray-600">
              Achieve your academic goals with our expert resources.
            </p>
            <Link to={createPageUrl("Books")}>
              <Button className="bg-[#1e3a5f] hover:bg-[#152a47] text-white px-6 py-3 rounded-md flex items-center gap-2 text-lg">
                Explore Books
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="lg:h-64"></div>
        </div>

        {/* Our Publications Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Our Publications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {publications.map((pub) => (
              <Link
                key={pub.class}
                to={createPageUrl(`Books?category=Class ${pub.class}`)}
                className="group"
              >
                <div className={`bg-gradient-to-br ${pub.color} rounded-xl p-6 text-white text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <div className="text-sm font-medium opacity-90">Class</div>
                  <div className="text-3xl lg:text-4xl font-bold">
                    {pub.class}<sup className="text-lg">th</sup>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/30">
                    <p className="text-xs">Advanced Study Guide</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}