// app/orders/[id]/confirmation/page.tsx
"use client";

import { useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id;

  // In a real app, you would fetch order details here
  // const { data: order } = useOrder(orderId as string);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 mb-8">
          Your order has been placed successfully and is being prepared.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Order #</div>
              <div className="font-mono font-bold text-lg">ORD-123456</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Estimated Ready</div>
              <div className="font-bold">30-45 min</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Status</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Preparing
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Payment</span>
              <span className="font-medium">Cash on Delivery</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold">$45.67</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Print Receipt
          </button>
          <button
            onClick={() => (window.location.href = "/orders/track")}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Track Order
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
