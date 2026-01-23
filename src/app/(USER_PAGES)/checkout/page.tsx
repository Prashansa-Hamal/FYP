"use client";
export const dynamic = "force-dynamic";

import { PlaceOrderButton } from "@/components/placeOrderButton";
import { CartSummarySkeleton } from "@/components/skeletons/cartSummarySkeleton";
import { useCartSummary } from "@/hooks/useSummary";
import { formatCurrency } from "@/lib/formatters";
import { PlaceOrderRequest } from "@/types/orders";
import {
  ShoppingCart,
  Package,
  Clock,
  MapPin,
  User,
  Shield,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CartSummaryPage() {
  const { data, isLoading, error } = useCartSummary();
  const searchParams = useSearchParams();

  const orderType = searchParams.get("orderType");
  const tableNumber = searchParams.get("tableNumber")
    ? Number(searchParams.get("tableNumber"))
    : undefined;

  const specialInstructions = searchParams.get("specialInstructions");
  const paymentMethod = searchParams.get("paymentMethod");
  const deliveryAddressId = searchParams.get("deliveryAddressId");

  const orderData = {
    orderType,
    tableNumber: tableNumber ?? undefined,
    specialInstructions,
    paymentMethod,
    deliveryAddressId,
  };

  function toPlaceOrderRequest(data: {
    orderType: string | null;
    tableNumber?: number;
    specialInstructions: string | null;
    paymentMethod: string | null;
    deliveryAddressId: string | null;
  }): PlaceOrderRequest {
    return {
      orderType:
        data.orderType === "DINE_IN" ||
        data.orderType === "TAKEAWAY" ||
        data.orderType === "DELIVERY"
          ? data.orderType
          : undefined,

      tableNumber: data.tableNumber,

      specialInstructions: data.specialInstructions ?? undefined,

      paymentMethod:
        data.paymentMethod === "CASH" ||
        data.paymentMethod === "CARD" ||
        data.paymentMethod === "ONLINE" ||
        data.paymentMethod === "WALLET"
          ? data.paymentMethod
          : undefined,

      deliveryAddressId: data.deliveryAddressId ?? undefined,
    };
  }

  if (isLoading) {
    return <CartSummarySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Cart
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load your cart items. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!data?.summary.itemCount) {
    return <EmptyCartState />;
  }

  const { summary } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DineEase</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Review Order</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            {/* Order Notes Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 w-full">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="w-full">
                    <h3 className="font-medium text-gray-900">
                      Delivery Address
                    </h3>
                    <p className="text-gray-600 mt-1">
                      123 Main Street, Suite 100
                      <br />
                      New York, NY 10001
                      <br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Contact Information
                    </h3>
                    <p className="text-gray-600 mt-1">
                      John Doe
                      <br />
                      (123) 456-7890
                      <br />
                      john@example.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order Summary
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Review your items before placing the order
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">
                    {summary.itemCount}{" "}
                    {summary.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-4">
                {summary.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {item.imageUrl ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          {item.category && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-gray-600">Qty:</span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          {item.specialInstructions && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Note:</span>{" "}
                              {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Unavailable Items Warning */}
              {summary.unavailableItems.length > 0 && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Some items are currently unavailable
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p className="mb-2">
                          The following items cannot be ordered at this time:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {summary.unavailableItems.map((item) => (
                            <li key={item.id}>
                              {item.name} (Quantity: {item.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Total & Actions */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Total
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({summary.itemCount} items)</span>
                    <span>{formatCurrency(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (13%)</span>
                    <span>{formatCurrency(summary.vatAmount)}</span>
                  </div>
                  {summary.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(summary.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(summary.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Estimated Delivery Time
                      </p>
                      <p className="text-blue-700">30-45 minutes</p>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Secure Payment • 256-bit SSL</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <PlaceOrderButton
                    orderData={toPlaceOrderRequest(orderData)}
                  />
                  <Link
                    href="/cart"
                    className="block w-full py-3 h-12 border border-gray-300 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </Link>
                </div>

                <div className="text-sm text-gray-600 mt-6">
                  <p>
                    By placing this order, you agree to our{" "}
                    <a href="/" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>

                {/* Guarantee */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">
                      Your satisfaction is guaranteed
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 text-center">
                  Need help?{" "}
                  <a
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Empty Cart State Component
function EmptyCartState() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Add delicious items to your cart to see them here
        </p>
        <div className="space-y-3">
          <Link
            href="/menu"
            className="inline-block w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Menu
          </Link>
          <Link
            href="/"
            className="inline-block w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
