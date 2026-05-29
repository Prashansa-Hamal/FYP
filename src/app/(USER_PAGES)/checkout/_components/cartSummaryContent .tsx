"use client";

import { PlaceOrderButton } from "@/components/buttons/placeOrderButton";
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
  Notebook,
  ArrowLeft,
  Phone,
  Wifi,
  ChefHat,
  Truck,
  Coffee,
  CreditCard,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { OrderType } from "@/types/enums";
import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EsewaCheckoutForm from "@/components/esewaCheckoutForm";

export default function CartSummaryContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartSummaryContents />
    </Suspense>
  );
}

function CartSummaryContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("orderType");
  const deliveryAddressId = searchParams.get("deliveryAddressId");
  const specialInstruction = searchParams.get("specialInstruction");
  const isPointsApplied = searchParams.get("isPointsApplied");

  if (!orderType) return <div>Error....</div>;

  const { data, isLoading, error, refetch } = useCartSummary({
    orderType: orderType as OrderType,
    addressId: deliveryAddressId!,
    specialInstruction: specialInstruction!,
    isPointsApplied: isPointsApplied === "true" ? true : false,
  });

  console.log("Cart Summary Data:", data);

  useEffect(() => {
    refetch();
  }, [orderType, deliveryAddressId, specialInstruction]);

  const tableNumber = searchParams.get("tableNumber")
    ? Number(searchParams.get("tableNumber"))
    : undefined;

  const paymentMethod = searchParams.get("paymentMethod");

  const orderData = {
    orderType,
    tableNumber: tableNumber ?? undefined,
    specialInstruction,
    paymentMethod,
    deliveryAddressId,
  };

  function toPlaceOrderRequest(data: {
    orderType: string | null;
    tableNumber?: number;
    specialInstruction: string | null;
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
      specialInstructions: data.specialInstruction ?? undefined,
      paymentMethod:
        data.paymentMethod === "COD" ||
        data.paymentMethod === "ESEWA" ||
        data.paymentMethod === "KHALTI"
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
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Cart
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your cart items. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.summary.itemCount) {
    return <EmptyCartState />;
  }

  const { summary } = data;

  // Get order type display info
  const orderTypeInfo = {
    DINE_IN: { icon: Coffee, label: "Dine In", color: "text-amber-600" },
    TAKEAWAY: { icon: Package, label: "Takeaway", color: "text-amber-600" },
    DELIVERY: { icon: Truck, label: "Delivery", color: "text-amber-600" },
  };
  const OrderIcon =
    orderTypeInfo[orderType as keyof typeof orderTypeInfo]?.icon || Coffee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <button
              onClick={() => router.back()}
              className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center pt-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Review Your Order
              </h1>
              <p className="text-white/90 text-sm">
                Please check your order details before placing
              </p>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Column - Order Items */}
            <div className="lg:w-2/3 space-y-6">
              {/* Order Type Badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full">
                  <OrderIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 capitalize">
                    {
                      orderTypeInfo[orderType as keyof typeof orderTypeInfo]
                        ?.label
                    }
                  </span>
                  {tableNumber && (
                    <span className="text-sm text-amber-600">
                      • Table {tableNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Information Card */}
              {(summary.deliveryAddress || summary.specialInstruction) && (
                <div className="bg-amber-50/30 rounded-xl border border-amber-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <Notebook className="w-3 h-3 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Additional Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {summary.deliveryAddress && (
                      <>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Delivery Address
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {summary.deliveryAddress.street},{" "}
                              {summary.deliveryAddress.city}
                              <br />
                              {summary.deliveryAddress.state},{" "}
                              {summary.deliveryAddress.postalCode}
                              <br />
                              {summary.deliveryAddress.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Contact Information
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {summary.deliveryAddress.name}
                              <br />
                              {summary.deliveryAddress.phone}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {summary.specialInstruction && (
                      <div className="flex items-start gap-3">
                        <Notebook className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Special Instruction
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {summary.specialInstruction}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items Card */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <Package className="w-3 h-3 text-amber-600" />
                      </div>
                      <h2 className="font-semibold text-gray-900">
                        Order Items
                      </h2>
                    </div>
                    <div className="bg-amber-50 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-amber-700">
                        {summary.itemCount}{" "}
                        {summary.itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {summary.items.map((item) => (
                    <div key={item.id} className="p-5">
                      <div className="flex gap-4">
                        {item.imageUrl ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-50 to-orange-50">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ChefHat className="h-8 w-8 text-amber-300" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              {item.category && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  {item.category.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-lg text-amber-600">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="text-xs text-gray-600">
                                Qty:
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {item.quantity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(item.price)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unavailable Items Warning */}
              {summary.unavailableItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">
                        Some items are currently unavailable
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        The following items cannot be ordered at this time:
                      </p>
                      <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
                        {summary.unavailableItems.map((item) => (
                          <li key={item.id}>
                            {item.name} (Quantity: {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Total */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl border border-amber-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900">Order Total</h2>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal ({summary.itemCount} items)
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(summary.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT (13%)</span>
                      <span className="text-gray-900">
                        {formatCurrency(summary.vatAmount)}
                      </span>
                    </div>
                    {summary.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(summary.discountAmount)}</span>
                      </div>
                    )}
                    {summary.loyaltyDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Loyalty Discount</span>
                        <span>
                          -{formatCurrency(summary.loyaltyDiscountAmount)}
                        </span>
                      </div>
                    )}
                    <Separator className="bg-amber-100" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-gray-900">Total</span>
                      <div className="text-xl font-bold text-amber-600">
                        {formatCurrency(summary.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="bg-amber-50/80 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">
                          Estimated{" "}
                          {orderType === "DELIVERY" ? "Delivery" : "Ready"} Time
                        </p>
                        <p className="text-sm text-amber-700">30-45 minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Badge */}
                  {paymentMethod && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Payment Method:
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {paymentMethod.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">
                      Secure Payment • 256-bit SSL
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {orderData.paymentMethod === "ESEWA" ? (
                      <EsewaCheckoutForm
                        orderData={orderData as PlaceOrderRequest}
                        totalPrice={summary.totalAmount}
                      />
                    ) : (
                      <PlaceOrderButton
                        orderData={toPlaceOrderRequest(orderData)}
                      />
                    )}
                    <Link href="/cart">
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-12 rounded-xl"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                      </Button>
                    </Link>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing this order, you agree to our{" "}
                    <a href="/terms" className="text-amber-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-amber-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </p>

                  {/* Guarantee */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-600">
                      Your satisfaction is guaranteed
                    </span>
                  </div>
                </div>

                {/* Help Section */}
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 justify-center">
                    <Coffee className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-gray-600 text-center">
                      Need help?{" "}
                      <a
                        href="/contact"
                        className="text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Contact Support
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty Cart State Component
function EmptyCartState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
            </div>
          </div>
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No items to review
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add delicious items to your cart to see them here
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6">
                  Browse Menu
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
