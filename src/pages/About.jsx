import React from 'react';
import { BookOpen, Users, Award, Target, CheckCircle } from "lucide-react";
import Footer from "../components/home/Footer";

export default function About() {
  const stats = [
    { number: "50K+", label: "Students Helped", icon: Users },
    { number: "500+", label: "Books Published", icon: BookOpen },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "98%", label: "Success Rate", icon: Target },
  ];

  const milestones = [
    { year: "2008", title: "Founded", description: "Started with a vision to provide quality education materials" },
    { year: "2012", title: "Expanded", description: "Launched JEE preparation materials" },
    { year: "2018", title: "Digital", description: "Introduced digital learning resources" },
    { year: "2024", title: "Leadership", description: "Became the leading educational publisher in India" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Pinene Academy</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Empowering students across India with world-class educational materials since 2008
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
                <stat.icon className="w-10 h-10 text-[#f97316] mx-auto mb-4" />
                <div className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">{stat.number}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6 text-lg">
                At Pinene Academy, we believe that every student deserves access to high-quality educational resources. 
                Our mission is to create comprehensive, exam-focused study materials that help students excel in their academic journey.
              </p>
              <ul className="space-y-4">
                {[
                  "Expert-authored content by top educators",
                  "Comprehensive coverage of all subjects",
                  "Regular updates aligned with latest syllabus",
                  "Affordable prices for all students"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#f97316] flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=500&fit=crop"
                alt="Students studying"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#0d9488] text-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-[#1e3a5f]/20"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                      <div className="text-[#0d9488] font-bold text-xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-[#0d9488] rounded-full flex-shrink-0 relative z-10"></div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1e3a5f] text-center mb-4">Our Expert Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our team consists of experienced educators, IIT alumni, and subject matter experts dedicated to student success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Rajesh Kumar",
                role: "Chief Academic Officer",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Prof. Anita Sharma",
                role: "Head of Content",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Dr. Suresh Patel",
                role: "JEE Expert",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#1e3a5f]">{member.name}</h3>
                  <p className="text-[#0d9488]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}