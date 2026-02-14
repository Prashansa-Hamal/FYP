"use client";

import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueView() {
  const weeklyData = [
    { day: "Mon", revenue: 2450, orders: 45 },
    { day: "Tue", revenue: 3100, orders: 58 },
    { day: "Wed", revenue: 2847, orders: 52 },
    { day: "Thu", revenue: 3250, orders: 62 },
    { day: "Fri", revenue: 4150, orders: 78 },
    { day: "Sat", revenue: 5200, orders: 95 },
    { day: "Sun", revenue: 4800, orders: 88 },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Apr", revenue: 61000 },
    { month: "May", revenue: 55000 },
    { month: "Jun", revenue: 67000 },
  ];

  const categoryData = [
    { name: "Main Courses", value: 45, color: "#f97316" },
    { name: "Appetizers", value: 20, color: "#3b82f6" },
    { name: "Desserts", value: 15, color: "#8b5cf6" },
    { name: "Beverages", value: 20, color: "#10b981" },
  ];

  const paymentMethodData = [
    { name: "Card", value: 55, color: "#f97316" },
    { name: "Cash", value: 30, color: "#3b82f6" },
    { name: "Digital", value: 15, color: "#8b5cf6" },
  ];

  const stats = [
    {
      name: "Total Revenue",
      value: "$25,797",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: "Average Order Value",
      value: "$45.80",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      name: "Total Orders",
      value: "478",
      change: "+15.3%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-orange-500",
    },
    {
      name: "Total Customers",
      value: "892",
      change: "-2.4%",
      trend: "down",
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  const topItems = [
    { name: "Grilled Salmon", orders: 45, revenue: 1282.5 },
    { name: "Ribeye Steak", orders: 38, revenue: 1710.0 },
    { name: "Margherita Pizza", orders: 52, revenue: 936.0 },
    { name: "Caesar Salad", orders: 67, revenue: 804.0 },
    { name: "Pasta Carbonara", orders: 41, revenue: 902.0 },
  ];

  const peakHours = [
    { hour: "11 AM", orders: 12 },
    { hour: "12 PM", orders: 28 },
    { hour: "1 PM", orders: 35 },
    { hour: "2 PM", orders: 22 },
    { hour: "3 PM", orders: 8 },
    { hour: "6 PM", orders: 42 },
    { hour: "7 PM", orders: 55 },
    { hour: "8 PM", orders: 48 },
    { hour: "9 PM", orders: 32 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUp : ArrowDown;

          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Weekly Revenue</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">This Week</span>
              <span className="font-semibold text-green-600">+12.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `$${value}`}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Monthly Trend</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Last 6 Months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: "#f97316", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentMethodData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `${value} orders`}
              />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Top Selling Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Item Name
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Orders
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, index) => (
                <tr
                  key={item.name}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-orange-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    {item.orders}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                    ${item.revenue.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    ${(item.revenue / item.orders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8" />
            <h3 className="font-semibold">Best Day This Week</h3>
          </div>
          <p className="text-3xl font-bold mb-2">Saturday</p>
          <p className="text-orange-100">$5,200 revenue • 95 orders</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <h3 className="font-semibold">Average Party Size</h3>
          </div>
          <p className="text-3xl font-bold mb-2">3.2 guests</p>
          <p className="text-blue-100">Based on this week's data</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8" />
            <h3 className="font-semibold">Tips Collected</h3>
          </div>
          <p className="text-3xl font-bold mb-2">$3,840</p>
          <p className="text-purple-100">Average 18.5% tip rate</p>
        </div>
      </div>
    </div>
  );
}
