"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddressSelect } from "./AddressSelect";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const CheckoutForm = () => {
  const router = useRouter();
  const [orderType, setOrderType] = useState<
    "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  >("DINE_IN");
  const [tableNumber, setTableNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "ONLINE" | "WALLET"
  >("CASH");
  const [deliveryAddressId, setDeliveryAddressId] = useState<string>("");

  const orderData = {
    orderType,
    tableNumber:
      orderType === "DINE_IN" ? parseInt(tableNumber) || undefined : undefined,
    specialInstructions,
    paymentMethod,
    deliveryAddressId,
  };

  const params = new URLSearchParams(
    Object.entries(orderData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  const canPlaceOrder = () => {
    if (orderType === "DINE_IN" && !tableNumber) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Order Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Order Type</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["DINE_IN", "TAKEAWAY", "DELIVERY"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`p-2 rounded-lg border text-center transition-colors ${
                orderType === type
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table Number (for DINE_IN) */}
      {orderType === "DINE_IN" && (
        <div>
          <label className="block text-sm font-medium mb-2">Table Number</label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter table number"
            min="1"
          />
        </div>
      )}
      {orderType === "DELIVERY" && (
        <AddressSelect
          onChange={(addressId: string) => {
            console.log("selectedId", addressId);
            setDeliveryAddressId(addressId);
          }}
        />
      )}

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Special Instructions (Optional)
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
          placeholder="Any special requests or dietary restrictions..."
        />
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {(["CASH", "CARD", "ONLINE", "WALLET"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`py-3 px-4 rounded-lg border text-center transition-colors ${
                paymentMethod === method
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.push(`/checkout?${params.toString()}`)}
          disabled={!canPlaceOrder()}
          className="w-full py-3 h-12 text-lg font-normal text-md bg-blue-600 text-white text-center rounded-xl hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Button>
        <Link
          href="/"
          className="block w-full h-12 py-3 border text-md border-gray-300 text-gray-700 text-center font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="inline mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
