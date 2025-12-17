'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, ChevronRight, Calendar } from 'lucide-react';

type Order = {
  id: string;
  total: number;
  displayTotal?: number; // Amount paid in selected currency
  displayCurrency?: string; // Currency used for payment (USD, EUR, etc.)
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: string;
  paymentReference: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    productImage?: string;
    selectedColor: string;
    selectedSize: string;
  }>;
};

export default function MyOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders');
      return;
    }
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyAmount = (amount: number, currencyCode: string = 'NGN') => {
    const symbols: Record<string, string> = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    const symbol = symbols[currencyCode] || currencyCode;
    const decimals = currencyCode === 'NGN' ? 0 : 2;
    
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'bg-gradient-to-r from-amber-50 to-yellow-50', 
        textColor: 'text-amber-800',
        border: 'border-l-4 border-amber-400',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Pending Payment' 
      },
      processing: { 
        icon: Truck, 
        color: 'bg-gradient-to-r from-blue-50 to-indigo-50', 
        textColor: 'text-blue-800',
        border: 'border-l-4 border-blue-400',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Processing' 
      },
      completed: { 
        icon: CheckCircle, 
        color: 'bg-gradient-to-r from-emerald-50 to-green-50', 
        textColor: 'text-emerald-800',
        border: 'border-l-4 border-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Delivered' 
      },
      cancelled: { 
        icon: XCircle, 
        color: 'bg-gradient-to-r from-red-50 to-pink-50', 
        textColor: 'text-red-800',
        border: 'border-l-4 border-red-400',
        badge: 'bg-red-100 text-red-800',
        label: 'Cancelled' 
      },
    };
    return configs[status as keyof typeof configs] || {
      icon: Package,
      color: 'bg-gray-50',
      textColor: 'text-gray-700',
      border: 'border-l-4 border-gray-400',
      badge: 'bg-gray-100 text-gray-800',
      label: status.charAt(0).toUpperCase() + status.slice(1)
    };
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-12 bg-gray-200 rounded-2xl w-64 mb-8 animate-pulse" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-6" />
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your purchases</p>
            </div>
          </div>
          
          {orders.length > 0 && (
            <div className="flex items-center gap-4 mt-6">
              <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Total Orders: </span>
                <span className="font-bold text-orange-600">{orders.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-12 sm:p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              When you place an order, it will appear here. Start exploring our amazing collection!
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </a>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-8">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              const displayAmount = order.displayTotal || order.total;
              const displayCurrency = order.displayCurrency || 'NGN';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 sm:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Package className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-medium">Order ID</p>
                          <p className="text-xl font-bold text-white">
                            #{order.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Placed on</p>
                          <p className="font-semibold text-white">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className={`px-6 sm:px-8 py-5 ${status.color} ${status.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${status.badge} flex items-center justify-center shadow-sm`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className={`font-bold text-xl ${status.textColor}`}>{status.label}</span>
                          <p className={`text-sm ${status.textColor} opacity-80 mt-0.5`}>
                            {status.label === 'Delivered' ? 'Your order has been delivered successfully!' : 
                             status.label === 'Processing' ? 'We are preparing your package for delivery' :
                             status.label === 'Pending Payment' ? 'Awaiting payment confirmation' : 
                             'This order has been cancelled'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Currency Badge */}
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                        <span className="text-2xl">{displayCurrency === 'USD' ? '$' : displayCurrency === 'EUR' ? '€' : displayCurrency === 'GBP' ? '£' : '₦'}</span>
                        <div className="text-left">
                          <p className="text-xs text-gray-500">Paid in</p>
                          <p className="font-bold text-gray-900">{displayCurrency}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Reference */}
                  <div className="px-6 sm:px-8 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Payment Reference</p>
                        <p className="text-sm font-mono text-gray-700 mt-0.5">{order.paymentReference}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 text-xl">Order Items</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="grid gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 hover:shadow-md transition-all border border-gray-100">
                          <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0 shadow-sm">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <Package className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-lg mb-2 truncate">{item.productName}</h4>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                                Qty: {item.quantity}
                              </span>
                              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                                {item.selectedColor}
                              </span>
                              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                                Size {item.selectedSize}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrencyAmount(item.price * item.quantity, displayCurrency)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatCurrencyAmount(item.price, displayCurrency)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Paid</p>
                          <p className="text-white/60 text-xs">in {displayCurrency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-white">
                          {formatCurrencyAmount(displayAmount, displayCurrency)}
                        </p>
                      </div>
                    </div>
                  </div>

                
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}