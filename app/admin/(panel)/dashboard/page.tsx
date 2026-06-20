"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Eye,
  XCircle,
  Package,
} from "lucide-react";
import Badge from "@/app/components/admin/ui/Badge";
import StatCard from "@/app/components/admin/ui/StatCard";
import EmptyState from "@/app/components/admin/ui/EmptyState";

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

const STATUS_TONE: { [key: string]: "slate" | "indigo" | "amber" | "emerald" | "red" } = {
  pending: "amber",
  processing: "indigo",
  completed: "emerald",
  cancelled: "red",
};

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

  return (
    <div className="space-y-6 min-h-screen p-1 bg-zinc-50/50">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} tone="slate" />
        <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} tone="amber" />
        <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle} tone="emerald" />
        <StatCard
          label="Revenue"
          value={`₦${(stats.totalRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          tone="emerald"
        />
        <StatCard label="Customers" value={stats.totalCustomers} icon={Users} tone="slate" />
      </div>

      {/* Orders Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-zinc-100 bg-[#22282E] p-5 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Recent Orders</h2>
            <p className="text-[11px] text-zinc-400 font-medium">Manage and review your transaction pipeline</p>
          </div>
          
          <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-900/40 p-1 border border-zinc-800">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  selectedStatus === status
                    ? "bg-[#FF6C2F] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-50" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={Package} title="No orders found" description="Orders matching this filter will show up here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={order.isNew ? "bg-[#FF6C2F]/5 hover:bg-[#FF6C2F]/10 transition-colors" : "hover:bg-zinc-50/80 transition-colors"}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs ${order.isNew ? "text-[#FF6C2F] font-semibold" : "text-zinc-500"}`}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {order.isNew && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF6C2F]" />}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.user?.image ? (
                          <img src={order.user.image} alt="" className="h-7 w-7 rounded-full border border-zinc-200 object-cover" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-zinc-100 border border-zinc-200" />
                        )}
                        <div>
                          <p className="font-semibold text-zinc-800">{order.userName}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{order.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-zinc-900">
                      ₦{order.total.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge tone={(STATUS_TONE[order.status] ?? "slate") as any}>{order.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                      <p className="font-medium text-zinc-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{formatTime(order.createdAt)}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#FF6C2F]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-[#FF6C2F] transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
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

      {/* Order Modal Drawer */}
      {showOrderModal && selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs" onClick={() => setShowOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-xl border border-zinc-100">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-[#22282E] p-5 text-white">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order Sheet Manifest</h2>
                  <p className="font-mono text-sm text-[#FF6C2F] font-bold">ID: {selectedOrder.id.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-6 text-xs text-zinc-600">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Customer Profile
                    </span>
                    <p className="text-xs font-semibold text-zinc-800">{selectedOrder.userName}</p>
                    <p className="font-mono text-[11px] text-zinc-500">{selectedOrder.userEmail}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Log Timestamp
                    </span>
                    <p className="text-xs font-semibold text-zinc-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="font-mono text-[11px] text-zinc-500">{formatTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Logistic Routing Address
                  </span>
                  <p className="text-xs text-zinc-700 font-medium">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Region: {selectedOrder.shippingAddress.state} • Route Code: {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-[#FF6C2F] font-semibold">Tel: {selectedOrder.shippingAddress.phone}</p>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Cart Breakdown Items
                  </span>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-3 bg-white hover:border-zinc-200 transition-colors">
                      <div className="flex items-center gap-3">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="h-9 w-9 rounded border border-zinc-100 object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded bg-zinc-50 border border-zinc-100" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-zinc-800">{item.productName}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            Qty {item.quantity} {item.selectedColor && `· ${item.selectedColor}`}{" "}
                            {item.selectedSize && `· ${item.selectedSize}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-zinc-800">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ledger Statement Total</span>
                  <span className="text-xl font-black text-[#FF6C2F] tracking-tight">₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}