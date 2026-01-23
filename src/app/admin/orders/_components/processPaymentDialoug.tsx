import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useUpdateOrderPaymentStatus } from "@/hooks/useOrders";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import { PaymentMethod } from "@/types/enums";

interface ProcessPaymentDialogProps {
  id: string;
  totalAmount: number;
  trigger?: React.ReactNode;
}

export function ProcessPaymentDialog({
  id,
  totalAmount,
  trigger,
}: ProcessPaymentDialogProps) {
  const { mutate: updatePaymentStatus, isPending } =
    useUpdateOrderPaymentStatus();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>();

  const handlePayment = (newStatus: PaymentMethod) => {
    updatePaymentStatus(
      {
        id: id,
        paymentMethod: newStatus as PaymentMethod,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Status updated successfully");
          closeRef.current?.click();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update status");
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Update Status</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Select a new status for this order.
          </DialogDescription>
        </DialogHeader>

        {/* Status Buttons */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {["CASH", "CARD", "ONLINE", "WALLET"].map((method) => (
                <Button
                  key={method}
                  variant={activeMethod === method ? "default" : "outline"}
                  onClick={() => setActiveMethod(method as PaymentMethod)}
                  className={`justify-start gap-2 ${
                    activeMethod === method
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }`}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button ref={closeRef} className="hidden" />
          </DialogClose>
          <Button
            className="w-full"
            onClick={() => {
              if (activeMethod) {
                handlePayment(activeMethod);
              }
            }}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              "Process Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
