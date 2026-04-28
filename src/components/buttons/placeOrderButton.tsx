import { Loader2, Check } from "lucide-react";
import { usePlaceOrder } from "@/hooks/useOrders";
import { Button } from "../ui/button";
import { PlaceOrderRequest } from "@/types/orders";

interface PlaceOrderButtonProps {
  orderData: PlaceOrderRequest;
  className?: string;
}

export const PlaceOrderButton = ({
  orderData,
  className = "",
}: PlaceOrderButtonProps) => {
  const { mutate, isPending, isSuccess } = usePlaceOrder();

  const handlePlaceOrder = () => {
    if (isPending) return;
    mutate(orderData);
  };

  return (
    <Button
      onClick={handlePlaceOrder}
      disabled={isPending || isSuccess}
      className={`w-full py-4 px-6 h-12 rounded-xl text-md transition-all ${
        isPending || isSuccess
          ? "bg-gray-300 cursor-not-allowed"
          : "w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
      } ${className}`}
    >
      {isPending ? (
        <span className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Placing Order...
        </span>
      ) : isSuccess ? (
        <span className="flex items-center justify-center">
          <Check className="h-5 w-5 mr-2" />
          Order Placed!
        </span>
      ) : orderData?.paymentMethod === "KHALTI" ? (
        "Pay via Khalti"
      ) : (
        "Place Order"
      )}
    </Button>
  );
};
