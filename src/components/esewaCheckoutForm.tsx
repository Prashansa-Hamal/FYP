"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { Button } from "./ui/button";
import { usePlaceOrder } from "@/hooks/useOrders";
import { PlaceOrderRequest } from "@/types/orders";
import { formatNumber } from "@/lib/formatters";

interface EsewaCheckoutFormProps {
  totalPrice: number;
  orderData: PlaceOrderRequest;
}

interface EsewaSignatureProps {
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  secret: string;
}

const EsewaCheckoutForm: React.FC<EsewaCheckoutFormProps> = ({
  totalPrice,
  orderData,
}) => {
  // Format amount to 2 decimal places
  const formattedAmount = formatNumber(totalPrice);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess } = usePlaceOrder();

  // Generate a unique transaction UUID
  const transactionUuid = uuidv4();

  // Form data state
  const [formData, setFormData] = useState({
    amount: formattedAmount,
    tax_amount: "0",
    total_amount: formattedAmount,
    transaction_uuid: transactionUuid,
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: process.env.NEXT_PUBLIC_ESEWA_PRODUCT_CODE || "EPAYTEST",
    success_url:
      process.env.NEXT_PUBLIC_ESEWA_SUCCESS_URL ||
      "http://localhost:3000/paymentsuccess",
    failure_url:
      process.env.NEXT_PUBLIC_ESEWA_FAILURE_URL ||
      "http://localhost:3000/paymentfailure",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
  });

  // Generate HMAC-SHA256 signature using CryptoJS (client-side)
  const generateSignature = ({
    total_amount,
    transaction_uuid,
    product_code,
    secret,
  }: EsewaSignatureProps): string => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(hashString, secret);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  // Generate signature whenever required fields change
  useEffect(() => {
    if (
      !formData.total_amount ||
      !formData.transaction_uuid ||
      !formData.product_code ||
      !formData.secret
    ) {
      return;
    }

    const hashedSignature = generateSignature({
      total_amount: formData.total_amount,
      transaction_uuid: formData.transaction_uuid,
      product_code: formData.product_code,
      secret: formData.secret,
    });

    setFormData((prev) => ({ ...prev, signature: hashedSignature }));
  }, [
    formData.total_amount,
    formData.transaction_uuid,
    formData.product_code,
    formData.secret,
  ]);

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First, place the order in your system
      const orderSuccess = mutate(orderData, {
        onSuccess: async () => {
          console.log("Order success:", orderSuccess);

          // Optional: You can also call your API to store the payment initiation
          // This is useful for tracking payment attempts
          const initiateResponse = await fetch("/api/esewa/initiate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              totalPrice: parseFloat(formData.total_amount),
              transactionId: formData.transaction_uuid,
            }),
          });

          if (!initiateResponse.ok) {
            const errorData = await initiateResponse.json();
            console.warn("Payment initiation tracking failed:", errorData);
            // Continue with form submission even if tracking fails
          }

          console.log("Submitting form to eSewa...");

          // Submit the form to eSewa
          const form = document.querySelector("form");
          if (!form) {
            console.error("Form element not found!");
            setError("Form submission failed. Please try again.");
            return;
          }

          (form as HTMLFormElement).submit();
          console.log("Form submitted to eSewa");
        },
        onError: () => setError("Failed to place order. Please try again."),
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
      method="POST"
    >
      {/* Hidden Fields - exclude secret from being submitted */}
      {Object.entries(formData).map(([key, value]) =>
        key !== "secret" ? (
          <input key={key} type="hidden" name={key} value={value} required />
        ) : null,
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        className={`w-full py-4 px-6 h-12 rounded-xl text-md transition-all ${
          isLoading
            ? "bg-gray-300 cursor-not-allowed"
            : "w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        }`}
      >
        {isLoading ? "Processing..." : "Pay via eSewa"}
      </Button>
    </form>
  );
};

export default EsewaCheckoutForm;
