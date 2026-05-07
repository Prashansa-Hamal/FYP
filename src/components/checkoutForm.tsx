"use client";

import {
  ArrowLeft,
  Utensils,
  Package,
  Truck,
  CreditCard,
  Wallet,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddressSelect } from "./AddressSelect";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { useTables } from "@/hooks/useTables";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const CheckoutForm = () => {
  const router = useRouter();
  const { getCartTotal, getItemCount } = useCart();
  const { data: currentUser, isLoading: authLoading } = useCurrentUser();
  const [orderType, setOrderType] = useState<
    "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  >("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "KHALTI" | "ESEWA"
  >("COD");
  const [deliveryAddressId, setDeliveryAddressId] = useState<string>("");

  const subtotal = getCartTotal();
  const DELIVERY_FEE = 100;
  const deliveryFee = orderType === "DELIVERY" ? DELIVERY_FEE : 0;
  const totalAmount = subtotal + deliveryFee;

  const orderData = {
    orderType,
    tableNumber:
      orderType === "DINE_IN" ? parseInt(tableNumber) || undefined : undefined,
    specialInstruction,
    paymentMethod,
    deliveryAddressId,
  };

  const { data: tablesData, isLoading: tablesLoading } = useTables();

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

  const orderTypeOptions = [
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
  ];

  const paymentOptions = [
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
      description: "Pay via Khalti wallet",
    },
  ];

  // Show login prompt if user is not authenticated
  if (!authLoading && !currentUser) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            Login required to place an order
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a free account or log in to continue. Your cart items will be
            saved.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
        <Link href="/">
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Menu
          </Button>
        </Link>
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
          {orderTypeOptions.map((type) => (
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
            onValueChange={(value) => setTableNumber(value)}
            disabled={tablesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Table Number" />
            </SelectTrigger>
            <SelectContent className="w-full">
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
          <AddressSelect
            onChange={(addressId: string) => {
              setDeliveryAddressId(addressId);
            }}
          />
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
          {paymentOptions.map((method) => (
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
          <span className="text-gray-600">Delivery Fee</span>
          {orderType === "DELIVERY" ? (
            <span className="font-medium text-gray-900">Rs. 100</span>
          ) : (
            <span className="text-green-600 font-medium">FREE</span>
          )}
        </div>
        {orderType === "DELIVERY" && (
          <p className="text-xs text-amber-600">
            Our staff will contact you to confirm the delivery address and timing.
          </p>
        )}
        <div className="pt-2 border-t border-amber-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total to Pay</span>
            <div className="text-xl font-bold text-amber-600">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={() => router.push(`/checkout?${params.toString()}`)}
          disabled={!canPlaceOrder()}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Proceed to Checkout
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Menu
          </Button>
        </Link>
      </div>
    </div>
  );
};
