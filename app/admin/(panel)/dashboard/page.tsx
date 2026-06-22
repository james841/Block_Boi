"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Eye,
  X,
  Package,
  ChevronDown,
} from "lucide-react";
import StatCard from "@/app/components/admin/ui/StatCard";
import EmptyState from "@/app/components/admin/ui/EmptyState";
import Badge, { STATUS_TONE } from "@/app/components/admin/ui/Badge";
import DonutGauge from "@/app/components/admin/ui/DonutGauge";

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
  user: { name: string; email: string; image: string };
};

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
};

const STATUS_FILTERS = ["all", "pending", "processing", "completed", "cancelled"];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.success) {
        const enriched = data.orders.map((order: any) => ({
          ...order,
          isNew: order.isNew ?? isNewOrder(order.createdAt),
        }));
        setOrders(enriched);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      console.error("Error updating order:", error);
    }
  };

  const markOrderAsSeen = async (orderId: string) => {
    try {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, isNew: false } : o)));
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNew: false }),
      });
      if (!response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, isNew: true } : o)));
      }
    } catch (error) {
      console.error("Error marking order as seen:", error);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    if (order.isNew) markOrderAsSeen(order.id);
  };

  const isNewOrder = (createdAt: string) => {
    const diffInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((o) => o.status === selectedStatus);

  const fulfillmentRate = stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;

  return (
    <div className="space-y-8 p-1">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} />
        <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle} />
        <StatCard label="Revenue" value={`₦${(stats.totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} />
        <StatCard label="Customers" value={stats.totalCustomers} icon={Users} />
      </div>

      {/* Orders + fulfillment */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-stone-200/60 bg-white shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex flex-col gap-4 border-b border-stone-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-950 tracking-tight">Recent Orders</h2>
              <p className="text-xs text-stone-500 mt-0.5">Manage and track your incoming pipeline</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1 self-start sm:self-auto">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                    selectedStatus === status
                      ? "bg-stone-950 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-50" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 flex justify-center items-center flex-1">
              <EmptyState icon={Package} title="No orders found" description="Orders matching this filter will show up here." />
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredOrders.slice(0, 8).map((order) => (
                    <tr key={order.id} className={`group transition-colors duration-150 ${order.isNew ? "bg-orange-50/40 hover:bg-orange-50/70" : "hover:bg-stone-50/80"}`}>
                      <td className="whitespace-nowrap px-6 py-4.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-1 rounded-md border border-stone-200/60">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {order.isNew && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {order.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={order.user.image} alt={order.userName} className="h-8 w-8 rounded-full object-cover ring-1 ring-stone-200" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-stone-950 flex items-center justify-center text-white text-[11px] font-bold">
                              {order.userName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-stone-850 tracking-tight">{order.userName}</p>
                            <p className="text-xs text-stone-400 font-normal">{order.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-stone-600 font-medium">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5 font-bold text-stone-950">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5">
                        <Badge tone={STATUS_TONE[order.status] ?? "slate"}>{order.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <div className="relative inline-flex items-center">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-stone-700 transition-shadow duration-150 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 text-stone-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="rounded-xl border border-stone-200 bg-white p-2 text-stone-500 shadow-sm transition-all duration-150 hover:bg-stone-50 hover:text-orange-500 hover:border-orange-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order fulfillment gauge */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-stone-950 tracking-tight mb-1">Order Fulfillment</h2>
          <p className="text-xs text-slate-500 mb-6">Overview of successful closures</p>
          <div className="flex justify-center bg-stone-50/50 rounded-2xl py-8 border border-stone-100">
            <DonutGauge percentage={fulfillmentRate} centerLabel={`${fulfillmentRate}%`} centerSubLabel="Completed" />
          </div>
          <div className="mt-6 space-y-3.5 border-t border-stone-100 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Completed Orders</span>
              <span className="font-bold text-stone-950 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg text-xs">
                {stats.completedOrders} / {stats.totalOrders}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Pending Orders</span>
              <span className="font-bold text-stone-950 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-lg text-xs">{stats.pendingOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order modal */}
      {showOrderModal && selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm transition-opacity duration-200" onClick={() => setShowOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 backdrop-blur-md px-6 py-5">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order ID</h2>
                  <p className="font-mono text-sm font-bold text-stone-950">{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-xl p-2 text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Customer Details
                    </span>
                    <p className="text-sm font-bold text-stone-850">{selectedOrder.userName}</p>
                    <p className="font-mono text-xs text-stone-500 mt-0.5">{selectedOrder.userEmail}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Placement Date
                    </span>
                    <p className="text-sm font-semibold text-stone-850">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="font-mono text-xs text-stone-500 mt-0.5">{formatTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Shipping Destination
                  </span>
                  <p className="text-sm font-medium text-stone-700 leading-relaxed">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedOrder.shippingAddress.state} • {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <div className="mt-3 border-t border-stone-200/60 pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-400">Contact Number</span>
                    <span className="font-mono text-xs font-semibold text-stone-700">{selectedOrder.shippingAddress.phone}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Manifest Items
                  </span>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-stone-100 p-3 bg-white hover:bg-stone-50/50 transition-colors duration-150">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.productImage} alt="" className="h-11 w-11 rounded-lg border border-stone-200/80 object-cover shadow-sm" />
                          ) : (
                            <div className="h-11 w-11 rounded-lg bg-stone-100 border border-stone-200/80" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-stone-850 tracking-tight">{item.productName}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-stone-500 font-medium">
                              <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">Qty {item.quantity}</span>
                              {item.selectedColor && <span className="w-1 h-1 rounded-full bg-stone-300" />}
                              {item.selectedColor && <span>{item.selectedColor}</span>}
                              {item.selectedSize && <span className="w-1 h-1 rounded-full bg-stone-300" />}
                              {item.selectedSize && <span>Size {item.selectedSize}</span>}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-stone-950 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-5 mt-2">
                  <span className="text-sm font-bold text-stone-500">Gross Total</span>
                  <span className="text-2xl font-black text-stone-950 tracking-tight">₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}