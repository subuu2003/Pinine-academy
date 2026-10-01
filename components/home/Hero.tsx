import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const publications = [
  { classNum: "9", color: "from-blue-500 to-blue-600" },
  { classNum: "10", color: "from-orange-400 to-orange-500" },
  { classNum: "11", color: "from-green-600 to-green-700" },
  { classNum: "12", color: "from-red-500 to-red-600" },
];

export function Hero() {
  return (
    <section 
      className="relative bg-white overflow-hidden"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/625e3ef95_hero-student.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center -60px',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              <span className="text-[#1e3a5f]">Empowering</span>{' '}
              <span className="text-[#0d9488]">Student Success</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Books & Study Materials for Classes 9<sup>th</sup> to 12<sup>th</sup> & JEE
            </p>
            <p className="text-gray-600 max-w-lg leading-relaxed">
              Achieve your highest academic potential with meticulously designed resources written by India's top educators.
            </p>
            <div className="pt-2">
              <Link href="/books">
                <Button className="bg-[#1e3a5f] hover:bg-[#152a47] text-white px-7 py-6 rounded-xl flex items-center gap-2 text-lg shadow-md hover:shadow-lg transition-all">
                  Explore Books
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block lg:h-64"></div>
        </div>

        {/* Publications Grid */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Our Core Publications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {publications.map((pub) => (
              <Link
                key={pub.classNum}
                href={`/books?category=Class ${pub.classNum}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${pub.color} rounded-2xl p-6 text-white text-center transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl shadow-md`}>
                  <div className="text-sm font-medium opacity-90">Class</div>
                  <div className="text-3xl lg:text-4xl font-black mt-1">
                    {pub.classNum}<sup className="text-base font-semibold">th</sup>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs font-medium tracking-wide">Advanced Study Guide</p>
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

