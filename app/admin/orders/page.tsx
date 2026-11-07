'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  Loader2, 
  Eye, 
  RefreshCw,
  Package,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/lib/apiClient';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminOrder {
  id: number;
  order_number: string;
  customer_name: string;
  phone_number: string;
  email: string;
  city: string;
  state: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  total_items_count: number;
  created_at: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    total_revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && (!isAuthenticated || (user?.role !== 'ADMIN' && !user?.is_staff))) {
      router.push('/sign-in');
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const fetchOrdersAndStats = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (paymentFilter !== 'ALL') params.append('payment_status', paymentFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [ordersRes, statsRes] = await Promise.all([
        apiClient.get(`/orders/?${params.toString()}`),
        apiClient.get('/orders/admin_stats/')
      ]);

      setOrders(ordersRes.data?.data || []);
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.is_staff)) {
      fetchOrdersAndStats();
    }
  }, [isAuthenticated, user, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrdersAndStats();
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">In Transit</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Processing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">Pending</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">PAID</span>;
      case 'REFUNDED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">REFUNDED</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">FAILED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">UNPAID (COD)</span>;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-50 antialiased overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0d9488] border border-teal-200 uppercase tracking-wider">
                Logistics & Orders
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e3a5f] tracking-tight">
                Publication Order Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Monitor candidate book orders, update shipment tracking, and process consignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrdersAndStats}
              className="rounded-xl border-gray-200 text-gray-600 hover:text-[#1e3a5f] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders Logged</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-[#1e3a5f]">{stats.total_orders}</span>
                <ShoppingBag className="w-5 h-5 text-teal-600" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Fulfillment</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-amber-600">{stats.pending_orders}</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivered Parcels</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-600">{stats.completed_orders}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Volume</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-[#0d9488]">₹{Math.round(stats.total_revenue || 0).toLocaleString('en-IN')}</span>
                <IndianRupee className="w-5 h-5 text-[#0d9488]" />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by Order #, Customer, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-2xl bg-gray-50/70 border-gray-200 text-sm focus:bg-white"
                />
              </form>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Confirmed', value: 'CONFIRMED' },
                  { label: 'Processing', value: 'PROCESSING' },
                  { label: 'In Transit', value: 'SHIPPED' },
                  { label: 'Delivered', value: 'DELIVERED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      statusFilter === tab.value
                        ? "bg-[#1e3a5f] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Filter Toolbar */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-semibold">Payment Status:</span>
                {['ALL', 'PENDING', 'PAID', 'REFUNDED'].map(pStatus => (
                  <button
                    key={pStatus}
                    onClick={() => setPaymentFilter(pStatus)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      paymentFilter === pStatus
                        ? "bg-[#0d9488] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {pStatus === 'ALL' ? 'All Payments' : pStatus}
                  </button>
                ))}
              </div>

              {(searchQuery || statusFilter !== 'ALL' || paymentFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setPaymentFilter('ALL');
                  }}
                  className="text-xs text-rose-600 hover:bg-rose-50 h-8"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading orders catalog...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Orders Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                    ? "No orders match your filter criteria. Try clearing search filters."
                    : "There are currently no orders placed in the system."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-6">Order Number</th>
                      <th className="py-3.5 px-6">Customer & Phone</th>
                      <th className="py-3.5 px-6">Destination</th>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Items</th>
                      <th className="py-3.5 px-6">Total Amount</th>
                      <th className="py-3.5 px-6">Payment</th>
                      <th className="py-3.5 px-6">Order Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-[#1e3a5f]">
                          #{order.order_number}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-800 text-xs">{order.customer_name}</p>
                          <p className="text-[11px] text-gray-400">{order.phone_number}</p>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {order.city}, {order.state}
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-700">
                          {order.total_items_count} {order.total_items_count === 1 ? 'copy' : 'copies'}
                        </td>
                        <td className="py-4 px-6 font-black text-[#0d9488] text-sm">
                          ₹{order.total_amount}
                        </td>
                        <td className="py-4 px-6">
                          {getPaymentBadge(order.payment_status)}
                        </td>
                        <td className="py-4 px-6">
                          {getOrderStatusBadge(order.order_status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold h-8 px-3 text-gray-700 hover:text-[#1e3a5f]">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
