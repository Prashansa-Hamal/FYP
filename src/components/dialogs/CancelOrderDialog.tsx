"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { toast } from "sonner";
import { OrderStatus } from "@/types/enums";
import {
  AlertTriangle,
  XCircle,
  Clock,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CancelOrderDialogProps {
  id: string;
  orderNumber?: string;
  currentStatus: OrderStatus;
  trigger?: React.ReactNode;
  onCancelSuccess?: () => void;
  isDisabled?: boolean;
}

// Helper function to check if order can be cancelled
export const canCancelOrder = (status: OrderStatus): boolean => {
  const cancellableStatuses = ["PENDING", "CONFIRMED"];
  return cancellableStatuses.includes(status);
};

// Get cancellation warning message based on order status
const getCancellationWarning = (status: OrderStatus): string => {
  switch (status) {
    case "PENDING":
      return "Your order is still pending confirmation. It can be cancelled immediately.";
    case "CONFIRMED":
      return "Your order has been confirmed and is waiting to be prepared. Cancellation may take a few moments to process.";
    default:
      return "This order cannot be cancelled at this stage.";
  }
};

// Get cancellation consequences
const getCancellationConsequences = (): string[] => {
  return [
    "Any loyalty points earned from this order will be reversed",
    "If payment was made, refund will be processed within 3-5 business days",
    "Cancelled orders cannot be restored",
  ];
};

export function CancelOrderDialog({
  id,
  orderNumber,
  currentStatus,
  trigger,
  onCancelSuccess,
  isDisabled = false,
}: CancelOrderDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const canCancel = canCancelOrder(currentStatus);
  const warningMessage = getCancellationWarning(currentStatus);
  const consequences = getCancellationConsequences();

  const handleCancelOrder = () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    updateStatus(
      {
        id: id,
        status: "CANCELLED" as OrderStatus,
        cancellationReason: cancellationReason.trim(),
      },
      {
        onSuccess: (data) => {
          toast.success("Order cancelled successfully");
          closeRef.current?.click();
          setCancellationReason("");
          onCancelSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to cancel order");
        },
      },
    );
  };

  // If order can't be cancelled, show a different dialog
  if (!canCancel) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={isDisabled}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-center text-red-600">
                  Cannot Cancel Order
                </DialogTitle>
                <DialogDescription className="text-center">
                  This order cannot be cancelled because it's already{" "}
                  <span className="font-semibold capitalize">
                    {currentStatus.toLowerCase()}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                <div className="flex items-start gap-3">
                  <ChefHat className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Orders in "{currentStatus.toLowerCase()}" status or beyond
                      cannot be cancelled. Please contact the restaurant
                      directly for assistance.
                    </p>
                    <p className="text-xs text-amber-700 mt-2">
                      Contact: +977 9801234567 or support@dineease.com
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isDisabled}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-red-600">
                Cancel Order
              </DialogTitle>
              <DialogDescription className="text-center">
                {orderNumber ? `Order #${orderNumber}` : "This order"} will be
                cancelled. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{warningMessage}</p>
              </div>
            </div>

            {/* Consequences */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                What happens after cancellation:
              </label>
              <ul className="space-y-1.5">
                {consequences.map((consequence, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2 mb-4">
              <label
                htmlFor="cancel-reason"
                className="text-sm font-medium text-gray-700"
              >
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancel-reason"
                rows={3}
                placeholder="Please tell us why you're cancelling this order..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="resize-none"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                This helps us improve our service
              </p>
            </div>

            {/* Order Status Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-medium capitalize text-gray-900">
                  {currentStatus.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Cancellation Time:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="flex space-x-2 sm:gap-0">
              <DialogClose asChild>
                <button ref={closeRef} className="hidden" />
              </DialogClose>
              <Button
                variant="outline"
                onClick={() => {
                  setCancellationReason("");
                  closeRef.current?.click();
                }}
                disabled={isPending}
                className="flex-1"
              >
                Keep Order
              </Button>
              <Button
                onClick={handleCancelOrder}
                disabled={isPending || !cancellationReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cancelling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <XCircle className="w-4 h-4" />
                    Yes, Cancel Order
                  </span>
                )}
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Simplified version for quick use
export function CancelOrderButton({
  id,
  orderNumber,
  currentStatus,
  onCancelSuccess,
}: {
  id: string;
  orderNumber?: string;
  currentStatus: OrderStatus;
  onCancelSuccess?: () => void;
}) {
  return (
    <CancelOrderDialog
      id={id}
      orderNumber={orderNumber}
      currentStatus={currentStatus}
      onCancelSuccess={onCancelSuccess}
      trigger={
        <Button
          variant="outline"
          className="border-red-200 w-full mt-0.5 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel Order
        </Button>
      }
    />
  );
}
