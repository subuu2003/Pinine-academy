'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, User as UserIcon, LogOut, Shield, LayoutDashboard, BookOpen, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Examinations', href: '/examinations' },
    { name: 'Notices', href: '/notices' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6969de984d800f56c19cd786/b4735fc45_IMG_20260117_094200.png" 
              alt="Pinene Academy Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-[#1e3a5f]">
              PINENE <span className="text-[#0d9488]">ACADEMY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.href === '/' 
                ? pathname === '/' 
                : pathname === link.href || (pathname?.startsWith(link.href) && !pathname?.startsWith('/admin'));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#1e3a5f] ${
                    isActive ? 'text-[#1e3a5f] font-semibold border-b-2 border-[#f97316] pb-1' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Actions & Cart */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <Link 
              href="/cart" 
              className="relative p-2 text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-xl transition-all"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0d9488] text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 hover:bg-gray-100 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold">
                        {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {user?.first_name ? `${user.first_name}` : user?.username}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-lg rounded-xl p-1.5">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          {user?.role === 'ADMIN' || user?.is_staff ? 'Administrator' : 'Student'}
                        </p>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone_number}</p>
                    </div>

                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link 
                          href={user?.is_staff || user?.role === 'ADMIN' ? '/admin' : '/dashboard'} 
                          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-600" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>

                      {!user?.is_staff && user?.role !== 'ADMIN' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/student/examinations" className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                              <BookOpen className="w-4 h-4 text-[#0d9488]" />
                              Examinations
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                              <UserIcon className="w-4 h-4 text-[#0d9488]" />
                              My Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/student/orders" className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                              <ShoppingBag className="w-4 h-4 text-[#0d9488]" />
                              My Orders
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </div>

                    <DropdownMenuSeparator className="my-1 border-gray-100" />

                    <DropdownMenuItem 
                      onClick={logout} 
                      className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-700 hover:text-[#1e3a5f]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Cart */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              href="/cart" 
              className="relative p-2 text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-xl transition-all"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0d9488] text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-base font-medium ${
                  pathname === link.href ? 'bg-blue-50 text-[#1e3a5f] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="p-3 bg-gray-50 rounded-xl mb-1">
                  <p className="text-xs text-gray-400 uppercase font-semibold">
                    {user?.role === 'ADMIN' || user?.is_staff ? 'Administrator' : 'Student'}
                  </p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone_number}</p>
                </div>
                <Link 
                  href={user?.is_staff || user?.role === 'ADMIN' ? '/admin' : '/dashboard'} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    Dashboard
                  </Button>
                </Link>
                {!user?.is_staff && user?.role !== 'ADMIN' && (
                  <>
                    <Link href="/student/examinations" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BookOpen className="w-4 h-4 text-[#0d9488]" />
                        Examinations
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <UserIcon className="w-4 h-4 text-[#0d9488]" />
                        My Profile
                      </Button>
                    </Link>
                    <Link href="/student/orders" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#0d9488]" />
                        My Orders
                      </Button>
                    </Link>
                  </>
                )}
                <Button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 justify-start gap-2 mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white">
                    Enroll Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
