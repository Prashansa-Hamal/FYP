import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";

const stats = [
  {
    name: "Today's Revenue",
    value: "$2,847.50",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    name: "Active Tables",
    value: "12/20",
    change: "60% occupied",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    name: "Pending Orders",
    value: "8",
    change: "2 ready",
    icon: ShoppingCart,
    color: "bg-orange-500",
  },
  {
    name: "Avg. Order Value",
    value: "$45.80",
    change: "+8.2%",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
];

const recentOrders = [
  {
    id: "ORD-1234",
    table: "Table 5",
    items: 4,
    amount: 78.5,
    status: "Ready",
    time: "5 min ago",
  },
  {
    id: "ORD-1235",
    table: "Table 12",
    items: 3,
    amount: 52.0,
    status: "Preparing",
    time: "8 min ago",
  },
  {
    id: "ORD-1236",
    table: "Table 3",
    items: 6,
    amount: 125.75,
    status: "Preparing",
    time: "12 min ago",
  },
  {
    id: "ORD-1237",
    table: "Table 8",
    items: 2,
    amount: 34.5,
    status: "Ready",
    time: "15 min ago",
  },
];

const activeReservations = [
  { name: "Sarah Johnson", time: "12:30 PM", guests: 4, table: "Table 15" },
  { name: "Michael Chen", time: "1:00 PM", guests: 2, table: "Table 7" },
  { name: "Emily Brown", time: "1:30 PM", guests: 6, table: "Table 10" },
];

const CashierPage = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Ready"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.table} • {order.items} items
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{order.time}</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    ${order.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Upcoming Reservations
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activeReservations.map((reservation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {reservation.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reservation.time} • {reservation.guests} guests
                      </p>
                      <p className="text-sm font-medium text-orange-600 mt-1">
                        {reservation.table}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <ShoppingCart className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-gray-900">New Order</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              New Reservation
            </span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              Process Payment
            </span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">
              View Reports
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashierPage;
