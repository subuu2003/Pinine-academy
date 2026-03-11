import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, User, LogOut } from "lucide-react";
import { useAuth, useClerk } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useAuth();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
  };

  const navLinks = [
    { name: "Home", page: "home" },
    { name: "About", page: "about" },
    { name: "Courses", page: "books" },
    { name: "Publications", page: "books" },
    { name: "Contact", page: "contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-0.2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/b4735fc45_IMG_20260117_094200.png" 
                alt="Pinene Academy Logo" 
                className="w-20 h-20 object-contain"
              />
              <span className="text-xl font-bold text-[#1e3a5f]">PINENE ACADEMY</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={createPageUrl(link.page)}
                  className={`text-gray-600 hover:text-[#1e3a5f] font-medium transition-colors ${
                    currentPageName === link.page ? 'text-[#1e3a5f] border-b-2 border-[#f97316]' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {user?.firstName || 'Account'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link to={createPageUrl("Admin")}>
                    <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white">
                      Admin Panel
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/sign-in">
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-[#1e3a5f]"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white">
                      Enroll Now
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={createPageUrl(link.page)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#1e3a5f] font-medium ${
                    currentPageName === link.page ? 'bg-blue-50 text-[#1e3a5f]' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t pt-4 mt-2 space-y-2">
                {isSignedIn ? (
                  <>
                    <Link to={createPageUrl("Admin")}>
                      <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white">
                        Admin Panel
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/sign-in">
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/sign-up">
                      <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white">
                        Enroll Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
