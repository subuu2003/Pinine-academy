import React from 'react';
import type { Metadata } from 'next';
import { BookOpen, Users, Award, Target, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Pinene Academy',
  description: 'Empowering students across India with world-class educational materials and books.',
};

export default function AboutPage() {
  const stats = [
    { number: "50K+", label: "Students Helped", icon: Users },
    { number: "500+", label: "Books Published", icon: BookOpen },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "98%", label: "Success Rate", icon: Target },
  ];

  const milestones = [
    { year: "2008", title: "Founded", description: "Started with a bold vision to provide accessible, quality educational materials." },
    { year: "2012", title: "JEE Expansion", description: "Launched specialized JEE Advanced and Main comprehensive problem archives." },
    { year: "2018", title: "Digital Integration", description: "Expanded curriculum resources into structured pedagogical tools." },
    { year: "2024", title: "Pan-India Reach", description: "Established trusted distribution and recognition across Indian schools." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">About Pinene Academy</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Empowering students across India with world-class educational materials, textbooks, and examination resources since 2008.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 shadow-sm">
                <stat.icon className="w-10 h-10 text-[#f97316] mx-auto mb-4" />
                <div className="text-3xl lg:text-4xl font-extrabold text-[#1e3a5f]">{stat.number}</div>
                <div className="text-gray-600 font-medium mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">Our Educational Mission</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                At Pinene Academy, we believe that every student deserves access to high-grade academic publications. 
                Our mission is to author rigorous, exam-focused study materials that demystify complex concepts and nurture genuine intellectual curiosity.
              </p>
              <ul className="space-y-4">
                {[
                  "Expert-authored content by premier educators and rankers",
                  "Comprehensive coverage of CBSE, State, and JEE curricula",
                  "Regular revisions reflecting current competitive examination paradigms",
                  "Uncompromising pedagogical clarity at affordable pricing"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0d9488] flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=500&fit=crop"
                  alt="Students studying"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#0d9488] text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-black">15+</div>
                <div className="text-sm font-medium">Years of Academic Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#1e3a5f] text-center mb-14">Our Journey & Milestones</h2>
          <div className="space-y-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl font-black text-[#0d9488] min-w-[70px]">{m.year}</span>
                <div>
                  <h3 className="text-xl font-bold text-[#1e3a5f]">{m.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

