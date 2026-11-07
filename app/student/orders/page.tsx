'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface OrderItemSummary {
  id: number;
  book_title: string;
  book_price: number;
  book_image_url: string;
  quantity: number;
}

interface OrderSummary {
  id: number;
  order_number: string;
  customer_name: string;
  phone_number: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  can_be_cancelled: boolean;
  total_items_count: number;
  created_at: string;
  items: OrderItemSummary[];
}

export default function StudentOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/sign-in?redirect=/student/orders');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/orders/');
      setOrders(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      // Catch error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.order_status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Delivered</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">In Transit</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Processing</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">Confirmed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Pending</span>;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden">
      {/* Student Sidebar */}
      <StudentSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Student Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                My Book Orders
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Track textbook deliveries, view receipts, and monitor consignment progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/books">
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]">
                Order Textbooks
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f]"
            >
              Refresh
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: 'All Orders', value: 'ALL' },
              { label: 'Confirmed / In Progress', value: 'CONFIRMED' },
              { label: 'In Transit', value: 'SHIPPED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  statusFilter === tab.value
                    ? "bg-[#1e3a5f] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Listing */}
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Retrieving your orders history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-teal-50 text-[#0d9488] rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No Orders Found</h3>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'ALL'
                  ? "No orders match this status filter. Try clearing filters."
                  : "You haven't placed any book orders yet. Browse our academic publications!"}
              </p>
              <Link href="/books" className="block pt-2">
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold">
                  Browse Publications Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-black text-[#1e3a5f]">
                        #{order.order_number}
                      </span>
                      {getStatusBadge(order.order_status)}
                      <span className="text-xs text-gray-400">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Total:</span>
                      <span className="text-lg font-black text-[#0d9488]">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.items.slice(0, 4).map(it => (
                        <div key={it.id} className="w-14 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0" title={it.book_title}>
                          <img src={it.book_image_url} alt={it.book_title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <span className="w-14 h-18 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                          +{order.items.length - 4} more
                        </span>
                      )}
                      <div className="text-xs text-gray-600 pl-2">
                        <p className="font-bold">{order.total_items_count} {order.total_items_count === 1 ? 'Book' : 'Books'}</p>
                        <p className="text-gray-400 truncate max-w-xs">{order.items.map(i => i.book_title).join(', ')}</p>
                      </div>
                    </div>

                    <Link href={`/student/orders/${order.id}`}>
                      <Button variant="outline" className="w-full sm:w-auto rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:text-[#1e3a5f]">
                        View Details & Tracking
                        <ChevronRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
