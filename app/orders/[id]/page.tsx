'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Clock, Truck, CheckCircle, 
  XCircle, ShoppingBag, Calendar, Copy, Check 
} from 'lucide-react';

// ... Order type stays the same ...

export default function MyOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrencyAmount = (amount: number, currencyCode: string = 'NGN') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'NGN' ? 0 : 2,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'bg-amber-50/50', 
        textColor: 'text-amber-800',
        border: 'border-l-4 border-amber-400',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Pending Payment' 
      },
      processing: { 
        icon: Truck, 
        color: 'bg-blue-50/50', 
        textColor: 'text-blue-800',
        border: 'border-l-4 border-blue-400',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Processing' 
      },
      completed: { 
        icon: CheckCircle, 
        color: 'bg-emerald-50/50', 
        textColor: 'text-emerald-800',
        border: 'border-l-4 border-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Delivered' 
      },
      cancelled: { 
        icon: XCircle, 
        color: 'bg-red-50/50', 
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

  if (isLoading) {
    return (
      <div className="mt-16 min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-orange-200 shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Orders</h1>
              <p className="text-gray-500 font-medium">History and status of your purchases</p>
            </div>
          </div>
          {orders.length > 0 && (
            <div className="px-5 py-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm inline-flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Volume</span>
              <span className="text-lg font-bold text-orange-600">{orders.length}</span>
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-16 text-center">
             {/* ... Empty State Content (Switch <a> to <Link>) ... */}
             <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-orange-200"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const displayCurrency = order.displayCurrency || 'NGN';

              return (
                <div key={order.id} className="group bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-100 transition-all duration-500">
                  {/* ID & Date Header */}
                  <div className="bg-gray-900 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Order ID</p>
                       <div className="flex items-center gap-2">
                        <code className="text-white font-mono text-lg">#{order.id.slice(-8).toUpperCase()}</code>
                        <button 
                          onClick={() => copyToClipboard(order.id)}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                        >
                          {copiedId === order.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className={`px-8 py-6 ${statusCfg.color} border-b border-gray-100 flex items-center justify-between`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl ${statusCfg.badge} flex items-center justify-center shadow-inner`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${statusCfg.textColor}`}>{statusCfg.label}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">Reference: <span className="font-mono">{order.paymentReference}</span></p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                       <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentStatus}
                       </span>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="p-8 space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="relative w-28 h-28 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                          {item.productImage ? (
                            <Image 
                              src={item.productImage} 
                              alt={item.productName} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="text-gray-300 w-8 h-8" /></div>
                          )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-xl font-bold text-gray-900">{item.productName}</h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight">Size {item.selectedSize}</span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight">{item.selectedColor}</span>
                            <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <p className="text-xl font-black text-gray-900">{formatCurrencyAmount(item.price * item.quantity, displayCurrency)}</p>
                          <p className="text-sm text-gray-400">{formatCurrencyAmount(item.price, displayCurrency)} / unit</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-gray-50 p-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-4">
                    <p className="text-gray-500 font-medium">Authorized transaction via <span className="text-gray-900 font-bold">SecurePay</span></p>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Grand Total</p>
                        <p className="text-3xl font-black text-gray-900 tabular-nums">
                          {formatCurrencyAmount(order.displayTotal || order.total, displayCurrency)}
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