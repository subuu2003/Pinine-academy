'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface OrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  phone_number: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    id: number;
    book_title: string;
    book_price: number;
    book_category: string;
    book_subject: string;
    book_image_url: string;
    quantity: number;
    item_subtotal: number;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await apiClient.get(`/orders/${orderId}/`);
        setOrder(res.data?.data);
      } catch (err) {
        // If forbidden or not found, redirect to books
        router.push('/books');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  if (isLoading || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Retrieving order confirmation...</p>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery: 4 days from created_at
  const orderDate = new Date(order.created_at);
  const estDate = new Date(orderDate);
  estDate.setDate(estDate.getDate() + 4);
  const estFormatted = estDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200/80 shadow-xs space-y-4 relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
              Order Confirmed & Logged
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1e3a5f] tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your textbook package has been registered with Pinine Academy Logistics. A dispatch notification will be sent once transit begins.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto flex items-center justify-between text-xs sm:text-sm font-bold text-gray-700">
            <span>Order Reference:</span>
            <span className="font-mono text-base text-[#1e3a5f]">#{order.order_number}</span>
          </div>
        </div>

        {/* Estimated Delivery & Shipping Coordinates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0d9488] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm text-[#1e3a5f]">Estimated Delivery</p>
                <p className="font-semibold text-emerald-700">{estFormatted}</p>
                <p className="text-gray-400">Via Express Academic Parcel Service</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm text-[#1e3a5f]">Delivering To</p>
                <p className="font-semibold text-gray-800">{order.customer_name} ({order.phone_number})</p>
                <p className="text-gray-500 leading-relaxed">
                  {order.address_line1}, {order.address_line2 ? `${order.address_line2}, ` : ''}{order.city}, {order.state} - {order.postal_code}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#1e3a5f]">Publications in this Parcel</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={item.book_image_url} alt={item.book_title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-gray-800 truncate">{item.book_title}</p>
                      <p className="text-gray-400">Qty: {item.quantity} × ₹{item.book_price}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-[#1e3a5f] shrink-0">
                    ₹{item.item_subtotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Financials Breakdown */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Charges:</span>
                <span className="font-bold text-gray-900">
                  {order.shipping_charges === 0 ? 'FREE' : `₹${order.shipping_charges}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#1e3a5f] pt-2 border-t border-gray-100">
                <span>Total Amount ({order.payment_method}):</span>
                <span className="text-lg text-[#0d9488]">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/books" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl border-gray-200 text-gray-700">
              Browse More Books
            </Button>
          </Link>

          <Link href={`/student/orders/${order.id}`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold shadow-md">
              Track Order Status
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
