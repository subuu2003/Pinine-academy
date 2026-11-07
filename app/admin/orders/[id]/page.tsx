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
  Printer, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Save, 
  Banknote,
  RotateCcw,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderDetail {
  id: number;
  order_number: string;
  user_username: string;
  user_email: string;
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('CONFIRMED');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && (!isAuthenticated || (user?.role !== 'ADMIN' && !user?.is_staff))) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/orders/${orderId}/`);
      const data = res.data?.data;
      setOrder(data);
      if (data) {
        setSelectedOrderStatus(data.order_status);
        setSelectedPaymentStatus(data.payment_status);
      }
    } catch (err: any) {
      toast.error('Order not found or inaccessible.');
      router.push('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff)) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, user, orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await apiClient.patch(`/orders/${order.id}/update_status/`, {
        order_status: selectedOrderStatus,
        payment_status: selectedPaymentStatus,
      });
      setOrder(res.data?.data);
      toast.success(`Order #${order.order_number} status updated successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Stock will be restored to the catalog.')) {
      return;
    }
    setIsUpdating(true);
    try {
      const res = await apiClient.post(`/orders/${order.id}/cancel/`);
      setOrder(res.data?.data);
      setSelectedOrderStatus('CANCELLED');
      toast.success(`Order #${order.order_number} cancelled and stock reversed.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoadingAuth || isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  const isCancelled = order.order_status === 'CANCELLED';

  return (
    <div className="flex h-full w-full bg-gray-50 antialiased overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-gray-500 hover:text-[#1e3a5f]">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                  Admin Order Manager
                </span>
                <span className="font-mono text-xs font-bold text-gray-800">#{order.order_number}</span>
              </div>
              <h1 className="text-lg font-black text-[#1e3a5f] tracking-tight">
                Order Processing & Consignment Details
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl border-gray-200 text-gray-700 hover:text-[#1e3a5f] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </Button>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                All Orders
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {/* Status Update Control Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4 print:hidden">
            <h2 className="text-base font-bold text-[#1e3a5f] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
              Fulfillment Status & Payment Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">
                  Order Status
                </label>
                <select
                  value={selectedOrderStatus}
                  onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  disabled={isCancelled}
                  className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold px-3 text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                >
                  <option value="PENDING">Pending Verification</option>
                  <option value="CONFIRMED">Confirmed / Order Accepted</option>
                  <option value="PROCESSING">Processing / Packing at Depot</option>
                  <option value="SHIPPED">Shipped / Dispatched via Courier</option>
                  <option value="DELIVERED">Delivered to Candidate</option>
                  <option value="CANCELLED">Cancelled (Reverses Stock)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold px-3 text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                >
                  <option value="PENDING">Pending Payment (COD)</option>
                  <option value="PAID">Paid in Full</option>
                  <option value="FAILED">Payment Failed</option>
                  <option value="REFUNDED">Payment Refunded</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="flex-1 h-11 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? 'Saving...' : 'Update Status'}
                </Button>

                {!isCancelled && (
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                    className="h-11 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold px-3"
                    title="Cancel order and reverse stock"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Destination Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0d9488]" />
                Customer Account
              </span>
              <p className="text-base font-bold text-gray-900">{order.customer_name}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Phone: <span className="font-bold text-gray-800">{order.phone_number}</span></p>
                <p>Email: <span className="font-bold text-gray-800">{order.email || order.user_email}</span></p>
                <p>Pinine Student Username: <span className="font-mono text-gray-700">@{order.user_username}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0d9488]" />
                Shipping Destination
              </span>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {order.address_line1}
                {order.address_line2 && <><br />{order.address_line2}</>}
                <br />
                {order.city}, {order.state} - <strong className="text-gray-900">{order.postal_code}</strong>
              </p>
              {order.notes && (
                <p className="text-xs text-gray-500 italic pt-1 border-t border-gray-100">
                  Landmark / Instructions: &quot;{order.notes}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Publications Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1e3a5f]">
                Ordered Publications ({order.items.length})
              </h2>
              <span className="text-xs font-bold text-gray-500">
                Payment: <strong className="text-gray-800">{order.payment_method}</strong>
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map(item => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={item.book_image_url} alt={item.book_title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {item.book_category && (
                          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                            {item.book_category}
                          </span>
                        )}
                        {item.book_subject && (
                          <span className="font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.book_subject}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-gray-900">{item.book_title}</p>
                      <p className="text-xs text-gray-400">Unit Price: ₹{item.book_price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs sm:text-sm">
                    <span className="font-bold text-gray-700">Qty: {item.quantity}</span>
                    <span className="font-black text-[#1e3a5f] text-base">₹{item.item_subtotal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
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
                <span>Grand Total:</span>
                <span className="text-xl text-[#0d9488]">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
