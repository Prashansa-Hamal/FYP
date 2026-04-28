"use client";

import { useLoyaltyStats } from "@/hooks/useLoyaltyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6"];

export function LoyaltyPointsChart() {
  const { data, isLoading, error } = useLoyaltyStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load loyalty statistics
        </CardContent>
      </Card>
    );
  }

  // For admin, the data structure might be different
  // This component expects the admin API response structure
  const summary = data.summary || {};
  const weeklyPoints = Array.isArray(data.weeklyPoints)
    ? data.weeklyPoints
    : [];
  const monthlyPoints = Array.isArray(data.monthlyPoints)
    ? data.monthlyPoints
    : [];
  const pointsByCategory = Array.isArray(data.pointsByCategory)
    ? data.pointsByCategory
    : [];
  const topUsers = Array.isArray(data.topUsers) ? data.topUsers : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Points Earned</p>
            <p className="text-2xl font-bold text-amber-600">
              {summary.totalPointsEarned?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Points Redeemed</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.totalPointsRedeemed?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.totalUsersWithPoints?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Avg Points/User</p>
            <p className="text-2xl font-bold text-purple-600">
              {summary.averagePointsPerUser?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      {weeklyPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Points Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="earned"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                    name="Points Earned"
                  />
                  <Area
                    type="monotone"
                    dataKey="redeemed"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Points Redeemed"
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    name="Net Points"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Chart */}
      {monthlyPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Points Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earned" fill="#f59e0b" name="Points Earned" />
                  <Bar
                    dataKey="redeemed"
                    fill="#ef4444"
                    name="Points Redeemed"
                  />
                  <Bar dataKey="net" fill="#10b981" name="Net Points" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points by Category */}
      {pointsByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Points by Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pointsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent
                          ? `${name}: ${(percent * 100).toFixed(0)}%`
                          : name
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="points"
                      nameKey="name"
                    >
                      {pointsByCategory.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        `${value.toLocaleString()} points`,
                        "Points",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          {topUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Loyalty Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.slice(0, 5).map((user: any, index: number) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          {user.currentBalance?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Projections */}
      {data.projections && (
        <Card>
          <CardHeader>
            <CardTitle>Points Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Projected Next Month</p>
                <p className="text-2xl font-bold text-amber-600">
                  {data.projections.projectedPointsNextMonth?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Redemptions</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.projections.estimatedRedemptions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.projections.growthRate > 0 ? "+" : ""}
                  {data.projections.growthRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
