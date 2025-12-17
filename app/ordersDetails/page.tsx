'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '../contexts/CurrencyContext';

interface Order {
  id: string;
  userEmail: string;
  userName: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  paymentReference: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

 

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <Link
                      href={`/order/${order.id}`}
                      className="text-lg font-semibold text-orange-600 hover:underline"
                    >
                      Order #{order.id.slice(-8)}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <p className="text-sm text-gray-600">Ref: {order.paymentReference.slice(0, 10)}...</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>

                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}