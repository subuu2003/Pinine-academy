'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Banknote,
  CreditCard,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  notes: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  can_be_cancelled: boolean;
  total_items_count: number;
  created_at: string;
  updated_at: string;
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

export default function StudentOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/orders/${orderId}/`);
      setOrder(res.data?.data);
    } catch (err: any) {
      toast.error('Order not found or inaccessible.');
      router.push('/student/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Stock will be released back to the catalog.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const res = await apiClient.post(`/orders/${order.id}/cancel/`);
      setOrder(res.data?.data);
      toast.success('Order cancelled successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoadingAuth || isLoading || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading order consignment details...</p>
        </div>
      </div>
    );
  }

  const isCancelled = order.order_status === 'CANCELLED';
  const steps = [
    { title: 'Order Placed', desc: 'Received & Logged', done: true },
    { title: 'Confirmed', desc: 'Assigned to Depot', done: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.order_status) },
    { title: 'Dispatched', desc: 'In Courier Transit', done: ['SHIPPED', 'DELIVERED'].includes(order.order_status) },
    { title: 'Delivered', desc: 'Arrived at Doorstep', done: order.order_status === 'DELIVERED' },
  ];

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/student/orders">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                  Consignment
                </span>
                <span className="font-mono text-xs font-bold text-gray-800">#{order.order_number}</span>
              </div>
              <h1 className="text-lg font-black text-[#1e3a5f] tracking-tight">
                Order Particulars & Dispatch Tracking
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/orders">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                All Orders
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {/* Tracking Pipeline or Cancelled Banner */}
          {isCancelled ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-2xs text-rose-600 shrink-0">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h2 className="text-base font-bold text-rose-900">Order Cancelled</h2>
                <p className="text-rose-700 leading-relaxed">
                  This publication order was cancelled on {new Date(order.updated_at).toLocaleDateString('en-IN')}. Stock allocation has been released back into Pinine Academy inventory.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-[#1e3a5f]">Delivery Timeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {steps.map((st, idx) => (
                  <div key={st.title} className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-colors",
                      st.done 
                        ? "bg-[#0d9488] text-white shadow-xs" 
                        : "bg-gray-100 text-gray-400"
                    )}>
                      {st.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold", st.done ? "text-[#1e3a5f]" : "text-gray-400")}>
                        {st.title}
                      </p>
                      <p className="text-[11px] text-gray-400">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#0d9488]" />
                Delivery Address
              </div>
              <p className="font-bold text-gray-800 text-sm">
                {order.customer_name}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {order.address_line1}
                {order.address_line2 && <><br />{order.address_line2}</>}
                <br />
                {order.city}, {order.state} - {order.postal_code}
              </p>
              <p className="text-xs text-gray-600 font-semibold pt-1">
                Contact: {order.phone_number} {order.email && `• ${order.email}`}
              </p>
              {order.notes && (
                <p className="text-xs text-gray-400 italic pt-1 border-t border-gray-100">
                  Note: &quot;{order.notes}&quot;
                </p>
              )}
            </div>

            {/* Payment & Logistics Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Banknote className="w-4 h-4 text-[#0d9488]" />
                Billing Particulars
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Preference:</span>
                  <span className="font-bold text-gray-800">{order.payment_method === 'COD' ? 'Cash / UPI on Delivery' : order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className={cn(
                    "font-bold uppercase px-2 py-0.5 rounded-full text-[10px]",
                    order.payment_status === 'PAID' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date:</span>
                  <span className="font-bold text-gray-800">
                    {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Books Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#1e3a5f]">Publications Ordered ({order.items.length})</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map(item => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={item.book_image_url} alt={item.book_title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {item.book_category && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            {item.book_category}
                          </span>
                        )}
                        {item.book_subject && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.book_subject}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#1e3a5f]">{item.book_title}</h3>
                      <p className="text-xs text-gray-400">Unit Price: ₹{item.book_price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium">Qty: {item.quantity}</span>
                    <span className="text-base font-black text-[#1e3a5f]">₹{item.item_subtotal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs sm:text-sm max-w-xs ml-auto">
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
              <div className="flex justify-between text-base font-extrabold text-[#1e3a5f] pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-xl text-[#0d9488]">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Option (if applicable) */}
          {order.can_be_cancelled && (
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Need to cancel this order?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Orders in Pending or Confirmed status can be cancelled with immediate stock reversal.
                </p>
              </div>

              <Button
                variant="outline"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold shrink-0"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
