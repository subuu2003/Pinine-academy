import React from 'react';
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8f] to-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/b4735fc45_IMG_20260117_094200.png" 
                alt="Pinene Academy Logo" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-2xl font-bold">PINENE ACADEMY</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Empowering students with quality educational resources for Classes 9-12 and JEE preparation.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#0d9488] transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#0d9488] transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#0d9488] transition-all duration-300 hover:scale-110">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#0d9488] transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-[#0d9488]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl("Home")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("About")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Books")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Our Books
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Contact")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Categories
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-[#0d9488]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl("Books?category=JEE Prep")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  JEE Preparation
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Books?category=Class 9")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Class 9-10
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Books?category=Class 11")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Class 11-12
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Books")} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  All Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Contact Info
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-[#0d9488]"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0d9488] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">123 Education Street, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0d9488] flex-shrink-0" />
                <span className="text-white/70 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0d9488] flex-shrink-0" />
                <span className="text-white/70 text-sm">info@pineneacademy.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">© 2024 Pinene Academy. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link to={createPageUrl("Contact")} className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to={createPageUrl("Contact")} className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
