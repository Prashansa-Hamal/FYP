"use client";

import {
  CreditCard,
  DollarSign,
  Receipt,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";

type PaymentMethod = "cash" | "card" | "digital";
type BillStatus = "pending" | "paid" | "partial";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

interface Bill {
  id: string;
  orderNumber: number;
  table: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  server: string;
  date: string;
  time: string;
}

export default function BillingView() {
  const [filter, setFilter] = useState<BillStatus | "all">("pending");

  const [bills] = useState<Bill[]>([
    {
      id: "BILL-1234",
      orderNumber: 1234,
      table: "Table 5",
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 28.5 },
        { name: "Caesar Salad", quantity: 2, price: 12.0 },
        { name: "Iced Tea", quantity: 2, price: 4.0 },
      ],
      subtotal: 78.5,
      tax: 7.85,
      tip: 15.7,
      total: 102.05,
      status: "pending",
      server: "Sarah M.",
      date: "2026-02-04",
      time: "12:45 PM",
    },
    {
      id: "BILL-1235",
      orderNumber: 1235,
      table: "Table 12",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.0 },
        { name: "Garlic Bread", quantity: 1, price: 6.0 },
        { name: "Coke", quantity: 2, price: 3.0 },
      ],
      subtotal: 52.0,
      tax: 5.2,
      tip: 10.4,
      total: 67.6,
      status: "paid",
      paymentMethod: "card",
      server: "Mike J.",
      date: "2026-02-04",
      time: "1:15 PM",
    },
    {
      id: "BILL-1236",
      orderNumber: 1236,
      table: "Table 3",
      items: [
        { name: "Ribeye Steak", quantity: 2, price: 45.0 },
        { name: "Mashed Potatoes", quantity: 2, price: 8.0 },
        { name: "Red Wine", quantity: 1, price: 35.0 },
      ],
      subtotal: 125.75,
      tax: 12.58,
      tip: 25.15,
      total: 163.48,
      status: "pending",
      server: "Emily R.",
      date: "2026-02-04",
      time: "1:30 PM",
    },
    {
      id: "BILL-1237",
      orderNumber: 1237,
      table: "Table 8",
      items: [
        { name: "Chicken Sandwich", quantity: 1, price: 15.5 },
        { name: "French Fries", quantity: 1, price: 6.0 },
        { name: "Lemonade", quantity: 1, price: 4.0 },
      ],
      subtotal: 34.5,
      tax: 3.45,
      tip: 6.9,
      total: 44.85,
      status: "paid",
      paymentMethod: "cash",
      server: "John D.",
      date: "2026-02-04",
      time: "11:30 AM",
    },
    {
      id: "BILL-1238",
      orderNumber: 1238,
      table: "Table 15",
      items: [
        { name: "Pasta Carbonara", quantity: 1, price: 22.0 },
        { name: "Tiramisu", quantity: 1, price: 8.5 },
      ],
      subtotal: 30.5,
      tax: 3.05,
      tip: 6.1,
      total: 39.65,
      status: "pending",
      server: "Sarah M.",
      date: "2026-02-04",
      time: "2:00 PM",
    },
    {
      id: "BILL-1239",
      orderNumber: 1239,
      table: "Table 7",
      items: [
        { name: "Beef Burger", quantity: 2, price: 16.0 },
        { name: "Onion Rings", quantity: 1, price: 7.0 },
      ],
      subtotal: 55.0,
      tax: 5.5,
      tip: 11.0,
      total: 71.5,
      status: "paid",
      paymentMethod: "digital",
      server: "Mike J.",
      date: "2026-02-04",
      time: "12:00 PM",
    },
  ]);

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      icon: Clock,
    },
    paid: {
      label: "Paid",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle,
    },
    partial: {
      label: "Partial",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: DollarSign,
    },
  };

  const paymentMethodLabels = {
    cash: "Cash",
    card: "Card",
    digital: "Digital Wallet",
  };

  const filteredBills =
    filter === "all" ? bills : bills.filter((bill) => bill.status === filter);

  const stats = {
    pending: bills
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + b.total, 0),
    paid: bills
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + b.total, 0),
    total: bills.reduce((sum, b) => sum + b.total, 0),
    count: bills.filter((b) => b.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Revenue Today</p>
          <p className="text-3xl font-semibold text-gray-900">
            ${stats.total.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Paid</p>
          <p className="text-3xl font-semibold text-green-700">
            ${stats.paid.toFixed(2)}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-3xl font-semibold text-yellow-700">
            ${stats.pending.toFixed(2)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow-sm p-6 border border-orange-200">
          <p className="text-sm text-orange-700 mb-1">Pending Bills</p>
          <p className="text-3xl font-semibold text-orange-700">
            {stats.count}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "paid"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Bills
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBills.map((bill) => {
          const StatusIcon = statusConfig[bill.status].icon;

          return (
            <div
              key={bill.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      #{bill.orderNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[bill.status].color}`}
                    >
                      <div className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[bill.status].label}
                      </div>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {bill.table} • {bill.server}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{bill.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {bill.items.map((item, index) => (
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

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${bill.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-900">${bill.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip (20%)</span>
                  <span className="text-gray-900">${bill.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${bill.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {bill.paymentMethod && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-700">
                      Paid via {paymentMethodLabels[bill.paymentMethod]}
                    </span>
                  </div>
                </div>
              )}

              {bill.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Process Payment
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Print
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBills.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No bills found with this status.</p>
        </div>
      )}
    </div>
  );
}
