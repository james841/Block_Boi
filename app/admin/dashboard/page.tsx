'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Users, 
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  LogOut,
  Plus,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package2,
  Check
} from 'lucide-react';

type ShippingAddress = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

type OrderItem = {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
};

type Order = {
  id: string;
  userName: string;
  userEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  isNew?: boolean;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  user: {
    name: string;
    email: string;
    image: string;
  };
};

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    checkAuth();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/admin/login');
        return;
      }

      setAdmin(data.admin);
      fetchOrders();
      fetchStats();
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        const enrichedOrders = data.orders.map((order: any) => ({
          ...order,
          isNew: order.isNew ?? isNewOrder(order.createdAt),
        }));
        setOrders(enrichedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        fetchStats();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // MARK ORDER AS SEEN - FIXED VERSION
  const markOrderAsSeen = async (orderId: string) => {
    try {
      // Optimistically update UI immediately
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, isNew: false } : o)
      );

      // Update in backend
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNew: false }),
      });

      if (!response.ok) {
        // Revert on failure
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, isNew: true } : o)
        );
        console.error('Failed to mark order as seen');
      }
    } catch (error) {
      console.error('Error marking order as seen:', error);
      // Revert on error
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, isNew: true } : o)
      );
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);

    // Mark as seen when viewed
    if (order.isNew) {
      markOrderAsSeen(order.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const isNewOrder = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className=" my-16 bg-gradient-to-r from-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
              <p className="text-slate-400">Welcome back, {admin?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchOrders}
                className="relative p-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <Bell className="w-6 h-6" />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/products/add')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
              >
                Manage Products
              </button>
              <button
                onClick={() => router.push('/admin/slider')}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
              >
                Slider
              </button>
              <button
                onClick={() => router.push('/admin/CategoryShowcase')}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
              >
                Categories
              </button>
              <button
                onClick={handleLogout}
                className="p-3 text-rose-400 hover:text-rose-300 hover:bg-slate-700 rounded-xl transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Orders</p>
            <p className="text-4xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
            </div>
            <p className="text-amber-100 text-sm mb-1">Pending</p>
            <p className="text-4xl font-bold">{stats.pendingOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Completed</p>
            <p className="text-4xl font-bold">{stats.completedOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Revenue</p>
            <p className="text-4xl font-bold">₦{(stats.totalRevenue / 1000).toFixed(1)}k</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <p className="text-rose-100 text-sm mb-1">Customers</p>
            <p className="text-4xl font-bold">{stats.totalCustomers}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
              <div className="flex gap-2">
                {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-slate-700/50 transition-colors ${
                      order.isNew ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${order.isNew ? 'text-blue-400' : 'text-slate-300'}`}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {order.isNew && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {order.user?.image && (
                          <img
                            src={order.user.image}
                            alt={order.user.name}
                            className="w-10 h-10 rounded-full border-2 border-slate-600"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{order.userName}</p>
                          <p className="text-xs text-slate-400">{order.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-400">
                        ₦{order.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className={`p-2 rounded-lg transition-colors ${
                            order.isNew 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-slate-700 text-blue-400 hover:bg-slate-600'
                          }`}
                          title={order.isNew ? "View New Order" : "View Details"}
                        >
                          {order.isNew ? <Eye className="w-4 h-4 animate-pulse" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL ORDER DETAILS MODAL - WITH BETTER MARGIN */}
      {showOrderModal && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setShowOrderModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full my-16 border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Order Details</h2>
                    <p className="text-slate-400">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
                      <Users className="w-4 h-4" />
                      Customer
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedOrder.user?.image && (
                        <img src={selectedOrder.user.image} alt="" className="w-14 h-14 rounded-full border-2 border-slate-600" />
                      )}
                      <div>
                        <p className="font-bold text-white text-lg">{selectedOrder.userName}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedOrder.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      Order Date
                    </div>
                    <p className="font-bold text-white">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-blue-400 font-medium flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-5 border border-emerald-700/50">
                  <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Shipping Address</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                    <p className="flex items-center gap-2">
                      <Package2 className="w-4 h-4 text-emerald-400" />
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-400">State:</span> {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-400">Zip:</span> {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-400">Country:</span> {selectedOrder.shippingAddress.country}
                    </p>
                    <p className="flex items-center gap-2 md:col-span-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-300 mb-4">
                    <Package2 className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                            <Package2 className="w-8 h-8 text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white">{item.productName}</p>
                          <p className="text-sm text-slate-400">
                            Qty: {item.quantity} 
                            {item.selectedColor && ` • Color: ${item.selectedColor}`}
                            {item.selectedSize && ` • Size: ${item.selectedSize}`}
                          </p>
                        </div>
                        <p className="font-bold text-emerald-400">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-xl font-bold">Total Amount</span>
                    <span className="text-4xl font-bold text-white">₦{selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end mt-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}