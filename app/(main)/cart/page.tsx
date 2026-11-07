'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    itemCount, 
    subtotal, 
    shippingCharges, 
    grandTotal, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/sign-in?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] via-[#244570] to-[#1e3a5f] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2">
                <ShoppingCart className="w-3.5 h-3.5" />
                Publication Cart
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Shopping Cart
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {itemCount} {itemCount === 1 ? 'publication' : 'publications'} selected for delivery.
              </p>
            </div>

            <Link href="/books">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Browsing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-gray-200/80 shadow-xs max-w-lg mx-auto space-y-5">
            <div className="w-20 h-20 bg-teal-50 text-[#0d9488] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Your Cart is Empty</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t added any textbooks or publications to your shopping cart yet. Browse our curated academic catalog!
              </p>
            </div>
            <Link href="/books" className="block pt-2">
              <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl h-11 px-8 text-sm font-bold shadow-md">
                Browse Curriculum Books
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Delivery Banner */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-gray-800">
                    <Truck className="w-4 h-4 text-[#0d9488]" />
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-emerald-700">🎉 Congratulations! You have unlocked FREE Express Delivery!</span>
                    ) : (
                      <span>Add <strong className="text-[#0d9488]">₹{remainingForFreeShipping}</strong> more for FREE Delivery!</span>
                    )}
                  </span>
                  <span className="text-gray-400">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300" 
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => (
                  <div key={item.book_id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-gray-50/50 transition-colors">
                    {/* Book Thumbnail & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              {item.category}
                            </span>
                          )}
                          {item.subject && (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {item.subject}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-[#1e3a5f] text-base sm:text-lg line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Unit Price: <span className="font-bold text-gray-700">₹{item.price}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                      {/* Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-1">
                        <button
                          onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-base sm:text-lg font-black text-[#1e3a5f]">
                          ₹{Math.round(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.book_id)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove book from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="flex justify-end pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCart}
                  className="text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear Entire Cart
                </Button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-[#1e3a5f] pb-3 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Items Subtotal ({itemCount}):</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      Shipping & Handling:
                      {shippingCharges === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">FREE</Badge>
                      )}
                    </span>
                    <span className="font-bold text-gray-900">
                      {shippingCharges === 0 ? '₹0.00' : `₹${shippingCharges}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-[#1e3a5f]">
                    <span>Total Amount:</span>
                    <span className="text-2xl text-[#0d9488]">₹{grandTotal}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    You will be asked to sign in or create an account to record your shipping coordinates.
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>100% Verified Pinine Academy Publications</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Fast Pan-India Delivery via SpeedPost & Courier</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Cash on Delivery & Verified Order Tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
