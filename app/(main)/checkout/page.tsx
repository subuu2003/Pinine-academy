'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  CreditCard,
  Banknote,
  PackageCheck
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { items, subtotal, shippingCharges, grandTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Odisha',
    postal_code: '',
    notes: '',
    payment_method: 'COD'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Auth Guard
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in?redirect=/checkout');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  // 2. Pre-fill with User profile data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
        phone_number: prev.phone_number || user.phone_number || '',
        email: prev.email || user.email || '',
        address_line1: prev.address_line1 || user.address || '',
        city: prev.city || user.city || '',
      }));
    }
  }, [user]);

  // 3. Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Full name is required';
    }
    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone_number = 'Valid 10-digit phone number is required';
    }
    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Street address / Plot / House no. is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    if (!formData.postal_code.trim() || formData.postal_code.trim().length < 4) {
      errors.postal_code = 'Valid postal / PIN code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (items.length === 0) {
      toast.error('Your cart is empty. Please add books before placing an order.');
      router.push('/books');
      return;
    }

    if (!validateForm()) {
      toast.error('Please complete all required delivery fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        notes: formData.notes.trim(),
        payment_method: formData.payment_method,
        items: items.map(it => ({
          book_id: it.book_id,
          quantity: it.quantity
        }))
      };

      const res = await apiClient.post('/orders/checkout/', payload);
      const order = res.data?.data;

      // Clear local cart
      await clearCart();

      toast.success('Order placed successfully!', {
        description: `Order #${order.order_number} confirmed.`
      });

      router.push(`/orders/${order.id}/confirmation`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to place order. Please check availability and retry.';
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-gray-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f]">Cart is Empty</h2>
          <p className="text-sm text-gray-500">
            Please add books to your shopping cart before proceeding to checkout.
          </p>
          <Link href="/books" className="block pt-2">
            <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl">
              Browse Publications Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#1e3a5f] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Return to Cart
          </Link>
          <span className="text-xs text-gray-400 font-semibold">
            Secure 256-bit SSL Checkout
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] tracking-tight mb-8">
          Checkout & Delivery Coordinates
        </h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Delivery Details Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Contact */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2 pb-3 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Contact & Student Identity
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_name" className="text-xs font-bold text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Subrat Kumar"
                      className="rounded-xl h-11"
                    />
                    {formErrors.customer_name && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.customer_name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number" className="text-xs font-bold text-gray-700">
                      Mobile / WhatsApp Number *
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="e.g. 9861247722"
                      className="rounded-xl h-11"
                    />
                    {formErrors.phone_number && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.phone_number}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-700">
                      Email Address (for order receipts & updates)
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. subrat@example.com"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2 pb-3 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Physical Delivery Address
                </h2>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address_line1" className="text-xs font-bold text-gray-700">
                      Flat / House No. / Building / Street Address *
                    </Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      placeholder="e.g. Flat 302, Green Garden Enclave, Khandagiri"
                      className="rounded-xl h-11"
                    />
                    {formErrors.address_line1 && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.address_line1}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address_line2" className="text-xs font-bold text-gray-700">
                      Area / Colony / Sector / Landmark (Optional)
                    </Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      placeholder="e.g. Near Big Bazaar / DAV Public School"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-bold text-gray-700">
                        City / Town *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Bhubaneswar"
                        className="rounded-xl h-11"
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-bold text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Odisha"
                        className="rounded-xl h-11"
                      />
                      {formErrors.state && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.state}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="postal_code" className="text-xs font-bold text-gray-700">
                        PIN / Postal Code *
                      </Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="e.g. 751030"
                        className="rounded-xl h-11"
                      />
                      {formErrors.postal_code && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.postal_code}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-gray-700">
                      Special Delivery Instructions / Gate Code (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Deliver between 2PM and 6PM, call upon arrival"
                      className="rounded-xl text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[#1e3a5f] flex items-center gap-2 pb-3 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Payment Preference
                </h2>

                <div className="space-y-3">
                  <label 
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.payment_method === 'COD' 
                        ? 'border-[#0d9488] bg-teal-50/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={formData.payment_method === 'COD'}
                      onChange={() => setFormData(p => ({ ...p, payment_method: 'COD' }))}
                      className="mt-1 accent-[#0d9488]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#1e3a5f]">
                        <Banknote className="w-4 h-4 text-[#0d9488]" />
                        Cash on Delivery (Pay on Delivery)
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Pay in cash or via UPI to the delivery executive upon package arrival at your doorstep.
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.payment_method === 'BANK_TRANSFER' 
                        ? 'border-[#0d9488] bg-teal-50/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="BANK_TRANSFER"
                      checked={formData.payment_method === 'BANK_TRANSFER'}
                      onChange={() => setFormData(p => ({ ...p, payment_method: 'BANK_TRANSFER' }))}
                      className="mt-1 accent-[#0d9488]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#1e3a5f]">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Direct Academic NEFT / UPI QR
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Official academy bank account transfer details will be generated on your order receipt.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Review Sticky Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-5 sticky top-24">
                <h2 className="text-lg font-bold text-[#1e3a5f] pb-3 border-b border-gray-100">
                  Review Publications ({items.length})
                </h2>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-100 text-xs">
                  {items.map(item => (
                    <div key={item.book_id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 truncate">{item.title}</p>
                        <p className="text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className="font-black text-gray-900 shrink-0">
                        ₹{Math.round(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Charges:</span>
                    <span className="font-bold text-gray-900">
                      {shippingCharges === 0 ? 'FREE (₹0.00)' : `₹${shippingCharges}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-[#1e3a5f]">
                    <span>Total Payable:</span>
                    <span className="text-2xl text-[#0d9488]">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order Button with Anti-duplicate Protection */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Securing & Placing Order...
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-5 h-5" />
                      Confirm & Place Order (₹{grandTotal})
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  By confirming, you authorize Pinine Academy to dispatch textbook copies to your address.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
