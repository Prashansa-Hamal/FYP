"use client";

import Link from "next/link";
import {
  Trash2,
  ShoppingCart,
  ArrowLeft,
  MapPin,
  Phone,
  Wifi,
  ChefHat,
  Coffee,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { CartItemCard } from "@/components/cards/cartItemCard";
import { CartSummarySkeleton } from "@/components/skeletons/cartSummarySkeleton";
import { Separator } from "@/components/ui/separator";
import { CheckoutForm } from "@/components/checkoutForm";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { cartItems, isLoading, clearCart, getCartTotal, getItemCount } =
    useCart();

  const subtotal = getCartTotal();
  const totalAmount = subtotal;

  if (isLoading) {
    return <CartSummarySkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-6">
                <h1 className="text-3xl font-bold text-white">Your Cart</h1>
                <p className="text-white/90 text-sm">
                  Review and manage your order
                </p>
              </div>
            </div>

            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-50 rounded-full mb-6">
                <ShoppingCart className="h-12 w-12 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any delicious items to your cart
                yet.
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
                    <ArrowLeft className="mr-2 h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Your Cart
                </h1>
                <p className="text-white/90 text-sm">
                  Review and manage your order items
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="font-semibold">{getItemCount()} items</span>
              </div>
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
            {/* Left Column - Cart Items */}
            <div className="lg:w-2/3 space-y-6">
              {/* Cart Items Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({getItemCount()})
                  </h2>
                </div>
                <button
                  onClick={() => clearCart.mutate()}
                  disabled={clearCart.isPending}
                  className="inline-flex items-center text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Clear All
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItemCard key={item.id} {...item} />
                ))}
              </div>

              {/* Order Summary Box - Mobile View */}
              <div className="lg:hidden bg-amber-50 rounded-xl p-5 border border-amber-100">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({getItemCount()} items)
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                </div>
                <Separator className="my-3 bg-amber-200" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-xl font-bold text-amber-600">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Checkout Form */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl border border-amber-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Complete Your Order
                    </h3>
                  </div>

                  <CheckoutForm />

                  {/* Help Section */}
                  <div className="mt-5 bg-amber-50/80 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-start gap-3">
                      <Coffee className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Need help?
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Our support team is available 24/7. Call us at{" "}
                          <span className="font-semibold">+977 9801234567</span>
                        </p>
                      </div>
                    </div>
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
