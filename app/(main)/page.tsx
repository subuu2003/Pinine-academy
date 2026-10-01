import React from 'react';
import { Hero } from '@/components/home/Hero';
import { JEEPrep } from '@/components/home/JEEPrep';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { BooksCarousel } from '@/components/home/BooksCarousel';
import { Testimonials } from '@/components/home/Testimonials';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <JEEPrep />
      <WhyChooseUs />
      <BooksCarousel />
      <Testimonials />
    </div>
  );
}

