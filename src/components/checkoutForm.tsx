"use client";

import {
  ArrowLeft,
  Utensils,
  Package,
  Truck,
  CreditCard,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddressSelect } from "./AddressSelect";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { useTables } from "@/hooks/useTables";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "./dialogs/LoginDialog";

const VAT_RATE = 0.13;
const POINTS_TO_CASH_RATE = 10;

export const CheckoutForm = () => {
  const router = useRouter();
  const {
    data: authData,
    isLoading: isAuthLoading,
    refetch: refetchAuth,
  } = useAuth();
  const { getCartTotal, getItemCount } = useCart();
  const [orderType, setOrderType] = useState<
    "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  >("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "KHALTI" | "ESEWA"
  >("COD");
  const [deliveryAddressId, setDeliveryAddressId] = useState<string>("");
  const [applyPoints, setApplyPoints] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: tablesData, isLoading: tablesLoading } = useTables();
  const { data: loyaltyResponse, refetch: refetchLoyalty } = useLoyaltyPoints();
  const userPoints = loyaltyResponse?.data?.points ?? 0;

  const subtotal = getCartTotal();
  const vatAmount = subtotal * VAT_RATE;

  const getLoyaltyDiscount = () => {
    if (!applyPoints || userPoints === 0 || !authData?.isAuthenticated)
      return 0;
    const maxDiscountFromPoints = subtotal * 0.5;
    const maxDiscountFromBalance = userPoints / POINTS_TO_CASH_RATE;
    return Math.min(maxDiscountFromPoints, maxDiscountFromBalance);
  };

  const loyaltyDiscount = getLoyaltyDiscount();
  const pointsToUse = Math.floor(loyaltyDiscount * POINTS_TO_CASH_RATE);
  const totalAmount = subtotal + vatAmount - loyaltyDiscount;

  const orderData = {
    orderType,
    tableNumber:
      orderType === "DINE_IN" ? parseInt(tableNumber) || undefined : undefined,
    specialInstruction,
    paymentMethod,
    deliveryAddressId,
    isPointsApplied: applyPoints,
  };

  const params = new URLSearchParams(
    Object.entries(orderData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  const canPlaceOrder = () => {
    if (orderType === "DINE_IN" && !tableNumber) return false;
    if (orderType === "DELIVERY" && !deliveryAddressId) return false;
    return true;
  };

  const handleProceedToCheckout = () => {
    if (!authData?.isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      router.push(`/checkout?${params.toString()}`);
    }
  };

  const handleLoginSuccess = async () => {
    // Refresh auth state
    await refetchAuth();
    // Refresh loyalty points
    await refetchLoyalty();
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="space-y-5">
        <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl" />
        <div className="h-24 w-full animate-pulse bg-gray-100 rounded-xl" />
        <div className="h-40 w-full animate-pulse bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Order Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              value: "DINE_IN",
              label: "Dine In",
              icon: Utensils,
              description: "Enjoy at our restaurant",
            },
            {
              value: "TAKEAWAY",
              label: "Takeaway",
              icon: Package,
              description: "Pick up your order",
            },
            {
              value: "DELIVERY",
              label: "Delivery",
              icon: Truck,
              description: "Get it delivered",
            },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setOrderType(type.value as typeof orderType)}
              className={`group p-3 rounded-xl border text-center transition-all duration-200 ${
                orderType === type.value
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-gray-200 hover:border-amber-200 hover:bg-amber-50/30"
              }`}
            >
              <type.icon
                className={`h-5 w-5 mx-auto mb-1 ${
                  orderType === type.value
                    ? "text-amber-600"
                    : "text-gray-400 group-hover:text-amber-500"
                }`}
              />
              <p
                className={`text-xs font-medium ${
                  orderType === type.value ? "text-amber-700" : "text-gray-600"
                }`}
              >
                {type.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                {type.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Table Number (for DINE_IN) */}
      {orderType === "DINE_IN" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table Number <span className="text-red-500">*</span>
          </label>
          <Select
            value={tableNumber}
            onValueChange={setTableNumber}
            disabled={tablesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Table Number" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tablesData?.data.map((table) => (
                  <SelectItem key={table.id} value={String(table.tableNumber)}>
                    Table {table.tableNumber}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Delivery Address */}
      {orderType === "DELIVERY" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Address <span className="text-red-500">*</span>
          </label>
          <AddressSelect onChange={setDeliveryAddressId} />
        </div>
      )}

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Instructions
        </label>
        <textarea
          value={specialInstruction}
          onChange={(e) => setSpecialInstruction(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          rows={2}
          placeholder="Any special requests or dietary restrictions..."
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              value: "COD",
              label: "Cash on Delivery",
              icon: Wallet,
              description: "Pay when you receive",
            },
            {
              value: "KHALTI",
              label: "Khalti",
              icon: CreditCard,
              description: "Pay via Khalti wallet",
            },
            {
              value: "ESEWA",
              label: "eSewa",
              icon: CreditCard,
              description: "Pay via eSewa wallet",
            },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() =>
                setPaymentMethod(method.value as typeof paymentMethod)
              }
              className={`group p-3 rounded-xl border text-center transition-all duration-200 ${
                paymentMethod === method.value
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-gray-200 hover:border-amber-200 hover:bg-amber-50/30"
              }`}
            >
              <method.icon
                className={`h-5 w-5 mx-auto mb-1 ${
                  paymentMethod === method.value
                    ? "text-amber-600"
                    : "text-gray-400 group-hover:text-amber-500"
                }`}
              />
              <p
                className={`text-xs font-medium ${
                  paymentMethod === method.value
                    ? "text-amber-700"
                    : "text-gray-600"
                }`}
              >
                {method.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Loyalty Points Section - Only show for logged in users */}
      {authData?.isAuthenticated && userPoints > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 rounded-full p-2">
                <span className="text-white text-sm">⭐</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Loyalty Points</h4>
                <p className="text-sm text-gray-600">
                  You have{" "}
                  <span className="font-bold text-amber-600">{userPoints}</span>{" "}
                  points
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {userPoints} points = Rs.{" "}
                  {(userPoints / POINTS_TO_CASH_RATE).toFixed(2)} discount
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="apply-points"
                checked={applyPoints}
                onCheckedChange={setApplyPoints}
              />
              <Label
                htmlFor="apply-points"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Apply Points
              </Label>
            </div>
          </div>

          {applyPoints && loyaltyDiscount > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points to use:</span>
                <span className="font-medium text-amber-600">
                  {pointsToUse} points
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points remaining after:</span>
                <span className="font-medium text-gray-700">
                  {userPoints - pointsToUse} points
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-amber-50/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({getItemCount()} items)
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">VAT (13%)</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(vatAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="text-green-600 font-medium">FREE</span>
        </div>
        {applyPoints && authData?.isAuthenticated && loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <span className="text-amber-500">🎉</span>
              Loyalty Discount
            </span>
            <span className="text-green-600 font-medium">
              -{formatCurrency(loyaltyDiscount)}
            </span>
          </div>
        )}
        <div className="pt-2 border-t border-amber-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total to Pay</span>
            <div className="text-xl font-bold text-amber-600">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Points to Earn */}
        {authData?.isAuthenticated && !applyPoints && (
          <div className="mt-2 pt-2 border-t border-amber-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <span className="text-amber-500">⭐</span>
                Points you'll earn on this order:
              </span>
              <span className="font-medium text-amber-600">
                {Math.floor(totalAmount)} points
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Conditional based on auth */}
      <div className="space-y-3 pt-2">
        {!authData?.isAuthenticated ? (
          <>
            {/* Login Button for guest users */}
            <Button
              onClick={handleProceedToCheckout}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Login to Place Order
            </Button>
            <p className="text-xs text-center text-gray-500">
              Already have items in cart? Login to complete your order
            </p>
          </>
        ) : (
          <>
            {/* Checkout Button for logged in users */}
            <Button
              onClick={handleProceedToCheckout}
              disabled={!canPlaceOrder()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Proceed to Checkout
            </Button>
          </>
        )}

        <Link href="/">
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Login Dialog Modal */}
      <LoginDialog
        open={showLoginDialog}
        onOpen={setShowLoginDialog}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};
