"use client";
import { Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";
import { useState } from "react";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  table: string;
  orderNumber: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  time: string;
  server: string;
}

export default function OrdersView() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const [orders] = useState<Order[]>([
    {
      id: "ORD-1234",
      table: "Table 5",
      orderNumber: 1234,
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 28.5 },
        { name: "Caesar Salad", quantity: 2, price: 12.0 },
        { name: "Iced Tea", quantity: 2, price: 4.0 },
      ],
      total: 78.5,
      status: "ready",
      time: "5 min ago",
      server: "Sarah M.",
    },
    {
      id: "ORD-1235",
      table: "Table 12",
      orderNumber: 1235,
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.0 },
        { name: "Garlic Bread", quantity: 1, price: 6.0 },
        { name: "Coke", quantity: 2, price: 3.0 },
      ],
      total: 52.0,
      status: "preparing",
      time: "8 min ago",
      server: "Mike J.",
    },
    {
      id: "ORD-1236",
      table: "Table 3",
      orderNumber: 1236,
      items: [
        { name: "Ribeye Steak", quantity: 2, price: 45.0 },
        { name: "Mashed Potatoes", quantity: 2, price: 8.0 },
        { name: "Red Wine", quantity: 1, price: 35.0 },
      ],
      total: 125.75,
      status: "preparing",
      time: "12 min ago",
      server: "Emily R.",
    },
    {
      id: "ORD-1237",
      table: "Table 8",
      orderNumber: 1237,
      items: [
        { name: "Chicken Sandwich", quantity: 1, price: 15.5 },
        { name: "French Fries", quantity: 1, price: 6.0 },
        { name: "Lemonade", quantity: 1, price: 4.0 },
      ],
      total: 34.5,
      status: "ready",
      time: "15 min ago",
      server: "John D.",
    },
    {
      id: "ORD-1238",
      table: "Table 15",
      orderNumber: 1238,
      items: [
        { name: "Pasta Carbonara", quantity: 1, price: 22.0 },
        { name: "Tiramisu", quantity: 1, price: 8.5 },
      ],
      total: 30.5,
      status: "pending",
      time: "2 min ago",
      server: "Sarah M.",
    },
    {
      id: "ORD-1239",
      table: "Table 7",
      orderNumber: 1239,
      items: [
        { name: "Beef Burger", quantity: 2, price: 16.0 },
        { name: "Onion Rings", quantity: 1, price: 7.0 },
      ],
      total: 55.0,
      status: "delivered",
      time: "25 min ago",
      server: "Mike J.",
    },
  ]);

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      icon: Clock,
    },
    preparing: {
      label: "Preparing",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      icon: ChefHat,
    },
    ready: {
      label: "Ready",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle,
    },
    delivered: {
      label: "Delivered",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: XCircle,
    },
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-semibold text-gray-900">
            {stats.pending}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Preparing</p>
          <p className="text-3xl font-semibold text-yellow-700">
            {stats.preparing}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Ready</p>
          <p className="text-3xl font-semibold text-green-700">{stats.ready}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Delivered</p>
          <p className="text-3xl font-semibold text-blue-700">
            {stats.delivered}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Orders
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setFilter(status as OrderStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      #{order.orderNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[order.status].color}`}
                    >
                      <div className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[order.status].label}
                      </div>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.table} • {order.server}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{order.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <button className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                      Start Preparing
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Mark as Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Mark as Delivered
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No orders found with this status.</p>
        </div>
      )}
    </div>
  );
}
