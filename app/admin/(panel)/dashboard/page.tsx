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
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} />
        <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle} />
        <StatCard label="Revenue" value={`₦${(stats.totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} />
        <StatCard label="Customers" value={stats.totalCustomers} icon={Users} />
      </div>

      {/* Orders + fulfillment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[15px] font-semibold text-stone-800">Recent Orders</h2>
            <div className="flex flex-wrap gap-1 rounded-full bg-stone-100 p-1">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    selectedStatus === status
                      ? "bg-white text-[#C2410C] shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
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
                <div key={i} className="h-12 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState icon={Package} title="No orders found" description="Orders matching this filter will show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredOrders.slice(0, 8).map((order) => (
                    <tr key={order.id} className={order.isNew ? "bg-orange-50/50" : "hover:bg-stone-50"}>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-stone-500">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {order.isNew && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C2410C]" />}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-stone-800">{order.userName}</p>
                        <p className="text-xs text-stone-400">{order.userEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-500">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-800">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Badge tone={STATUS_TONE[order.status] ?? "slate"}>{order.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
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

        {/* Order fulfillment gauge — real data, mirrors the "Fleet Capacity" card */}
        <div className="rounded-2xl border border-stone-200/70 bg-white p-6">
          <h2 className="mb-5 text-[15px] font-semibold text-stone-800">Order Fulfillment</h2>
          <div className="flex justify-center">
            <DonutGauge percentage={fulfillmentRate} centerLabel={`${fulfillmentRate}%`} centerSubLabel="Completed" />
          </div>
          <div className="mt-6 space-y-3 border-t border-stone-100 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Completed Orders</span>
              <span className="font-semibold text-stone-800">
                {stats.completedOrders} / {stats.totalOrders}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Pending Orders</span>
              <span className="font-semibold text-stone-800">{stats.pendingOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order modal */}
      {showOrderModal && selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-stone-900/50" onClick={() => setShowOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white p-5">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Order</h2>
                  <p className="font-mono text-sm text-stone-800">{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                      Customer
                    </span>
                    <p className="text-sm font-medium text-stone-800">{selectedOrder.userName}</p>
                    <p className="font-mono text-xs text-stone-500">{selectedOrder.userEmail}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                      Placed
                    </span>
                    <p className="text-sm text-stone-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="font-mono text-xs text-stone-500">{formatTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Shipping
                  </span>
                  <p className="text-sm text-stone-700">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-xs text-stone-500">
                    {selectedOrder.shippingAddress.state} • {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="mt-1 font-mono text-xs text-stone-600">Tel: {selectedOrder.shippingAddress.phone}</p>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Items
                  </span>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 p-3">
                      <div className="flex items-center gap-3">
                        {item.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.productImage} alt="" className="h-9 w-9 rounded-lg border border-stone-200 object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-stone-100" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-stone-800">{item.productName}</p>
                          <p className="text-xs text-stone-400">
                            Qty {item.quantity} {item.selectedColor && `· ${item.selectedColor}`}{" "}
                            {item.selectedSize && `· ${item.selectedSize}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-stone-700">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                  <span className="text-sm font-semibold text-stone-500">Total</span>
                  <span className="text-xl font-bold text-stone-900">₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
