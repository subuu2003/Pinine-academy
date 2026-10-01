import React from 'react';
import { BookOpen, FileText, Target, Award } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: "Expert Authors",
    description: "Books authored by veteran educators, top IITians, and board exam specialists.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: FileText,
    title: "Comprehensive Content",
    description: "Complete chapter-wise breakdowns, illustrated examples, and graded practice exercises.",
    color: "bg-teal-50 text-teal-600"
  },
  {
    icon: Target,
    title: "Exam-Focused",
    description: "Targeted problem banks aligned strictly with the latest NCERT, CBSE, and JEE patterns.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Award,
    title: "Proven Track Record",
    description: "Thousands of students across India securing top percentile ranks each year.",
    color: "bg-orange-50 text-orange-600"
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1e3a5f]">
          Why Choose Pinene Academy?
        </h2>
        <p className="text-gray-600 mt-3 text-lg">
          We combine pedagogical excellence with crystal-clear explanations to make learning effortless and rewarding.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-[#1e3a5f] mb-3">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

