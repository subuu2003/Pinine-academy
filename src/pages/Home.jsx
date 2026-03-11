import React from 'react';
import Hero from "../components/home/Hero";
import JEEPrep from "../components/home/JEEPrep";
import WhyChooseUs from "../components/home/WhyChooseUs";
import BooksCarousel from "../components/home/BooksCarousel";
import Testimonials from "../components/home/Testimonials";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <JEEPrep />
      <WhyChooseUs />
      <BooksCarousel />
      <Testimonials />
      <Footer />
    </div>
  );
}