import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const publications = [
  { class: "9", color: "from-blue-500 to-blue-600" },
  { class: "10", color: "from-cyan-500 to-cyan-600" },
  { class: "11", color: "from-teal-500 to-teal-600" },
  { class: "12", color: "from-indigo-500 to-indigo-600" },
];

export default function PublicationsGrid() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">Our Publications</h2>
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
            </div>
            <p className="text-center text-sm text-gray-600 mt-2 group-hover:text-[#1e3a5f]">
              Advanced Study Guide
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}