import { useKhaltiPayment } from "@/hooks/useKhaltiPayment";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";

interface KhaltiPaymentButtonProps {
  orderId: string;
  onSuccess?: () => void;
  className?: string;
}

export function KhaltiPaymentButton({
  orderId,
  onSuccess,
  className = "",
}: KhaltiPaymentButtonProps) {
  const { mutate: initiatePayment, isPending } = useKhaltiPayment({
    onSuccess: (data) => {
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-2">
      <Button
        onClick={() => initiatePayment(orderId)}
        disabled={isPending}
        className={`bg-purple-600 w-full hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Processing...
          </span>
        ) : (
          "Pay with Khalti"
        )}
      </Button>

      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold text-gray-700 mb-2">Test Credentials</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            📱 Khalti IDs: 9800000000, 9800000001, 9800000002, 9800000003,
            9800000004, 9800000005
          </li>
          <li>🔑 MPIN: 1111</li>
          <li>🔢 OTP: 987654</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Use these on the Khalti payment page
        </p>
      </div>

      {/* API Info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Using Khalti Payment Gateway v2</p>
        <p>Payment link expires in 60 minutes</p>
      </div>
    </div>
  );
}
