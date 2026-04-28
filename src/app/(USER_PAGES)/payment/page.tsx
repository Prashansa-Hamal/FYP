"use client";

import { KhaltiPaymentButton } from "@/components/buttons/KhaltiPaymentButton";
import EsewaCheckoutForm from "@/components/esewaCheckoutForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  const apiRoutes = [
    "/api/stats/customers/acquisition",
    "/api/stats/dashboard/overview",
    "/api/stats/inventory/stock-levels",
    "/api/stats/menu/category-performance",
    "/api/stats/menu/top-items",
    "/api/stats/orders/status-distribution",
    "/api/stats/orders/timeline",
    "/api/stats/orders/type-distribution",
    "/api/stats/payments/method-distribution",
    "/api/stats/realtime/current",
    "/api/stats/revenue/daily",
    "/api/stats/revenue/hourly",
    "/api/stats/revenue/monthly",
    "/api/stats/staff/performance",
    "/api/stats/tables/occupancy",
  ];

  async function fetchAllStats() {
    const results = await Promise.all(
      apiRoutes.map(async (route) => {
        try {
          const res = await fetch(route);
          const data = await res.json();
          return { route, data };
        } catch (error) {
          return { route, error };
        }
      }),
    );

    results.forEach((result) => {
      console.log("📊", result.route);
      console.log(result.data || result.error);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Order ID:</p>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{orderId}</p>
          <Input onChange={(e) => setOrderId(e.target.value)} />
        </div>

        <KhaltiPaymentButton orderId={orderId} />

        <EsewaCheckoutForm totalPrice={10999} orderData={"some data" as any} />
      </div>
      <Button onClick={() => fetchAllStats()}>Fetch Data</Button>
    </div>
  );
}
