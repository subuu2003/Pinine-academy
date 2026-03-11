import React from 'react';
import { BookOpen, FileText, Target, Award } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Expert Authors",
    description: "Books authored by experts, top-scoring educators.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: FileText,
    title: "Comprehensive Content",
    description: "Study guide to extensive syllabus with are quality experts.",
    color: "bg-teal-50 text-teal-600"
  },
  {
    icon: Target,
    title: "Exam-Focused",
    description: "Content designed to excel in exams, precise explanations.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Excel with profiteer specification with support desiIts.",
    color: "bg-orange-50 text-orange-600"
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl lg:text-3xl font-bold text-[#1e3a5f] text-center mb-12">
        Why Choose Us?
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center group"
          >
            <div className={`w-16 h-16 mx-auto rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-[#1e3a5f] mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}