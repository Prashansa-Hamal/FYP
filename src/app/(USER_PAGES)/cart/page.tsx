"use client";

import Link from "next/link";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { CartItemCard } from "@/components/cards/cartItemCard";
import { CartSummarySkeleton } from "@/components/skeletons/cartSummarySkeleton";
import { Separator } from "@/components/ui/separator";
import { CheckoutForm } from "@/components/checkoutForm";

export default function CartPage() {
  const { cartItems, isLoading, clearCart, getCartTotal, getItemCount } =
    useCart();

  const subtotal = getCartTotal();
  // add fees like delevery address or something like that
  const totalAmount = subtotal;

  if (isLoading) {
    return <CartSummarySkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Browse Menu
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DineEase</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full">
                  {getItemCount()}
                </span>
                <span>items in cart</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage your order items
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            {/* Left Column - Cart Items */}
            {/* Cart Items Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({getItemCount()})
                </h2>
                <button
                  onClick={() => clearCart.mutate()}
                  disabled={clearCart.isPending}
                  className="inline-flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col gap-2 ">
              {cartItems.map((item) => (
                <CartItemCard key={item.id} {...item} />
              ))}
            </div>

            {/* Order Summary Box */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({getItemCount()} items)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>
              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Additional Info */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free delivery on orders over $20</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>30-minute delivery guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <CheckoutForm />
                {/* Help Section */}
                <div className="mt-4 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Need help?</span> Our support
                    team is available 24/7.{" "}
                    <Link
                      href="/contact"
                      className="text-blue-800 font-medium hover:underline"
                    >
                      Contact us
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
