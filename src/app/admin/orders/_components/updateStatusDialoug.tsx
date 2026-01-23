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
import { OrderStatus } from "@/generated/prisma/enums";
import { getStatusConfig } from "@/utils/orders-helper";
import { useRef, useState } from "react";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface UpdateOrderStatusDialogProps {
  id: string;
  currentStatus: OrderStatus;
  trigger?: React.ReactNode;
}

export function UpdateOrderStatusDialog({
  id,
  currentStatus,
  trigger,
}: UpdateOrderStatusDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const [activeStatus, setActiveStatus] = useState<OrderStatus>(currentStatus);

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateStatus(
      {
        id: id,
        status: newStatus,
        cancellationReason: cancellationReason || "No reason provided",
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Status updated successfully");
          closeRef.current?.click();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update status");
        },
      }
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
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              "PENDING",
              "CONFIRMED",
              "PREPARING",
              "READY",
              "SERVED",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => {
              const config = getStatusConfig(status as OrderStatus);

              return (
                <Button
                  key={status}
                  type="button"
                  variant={activeStatus === status ? "default" : "outline"}
                  onClick={() => setActiveStatus(status as OrderStatus)}
                  className={`justify-start gap-2 ${
                    activeStatus === status
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }`}
                >
                  {config.icon}
                  {config.label}
                </Button>
              );
            })}
          </div>
          {currentStatus !== "CANCELLED" && activeStatus === "CANCELLED" && (
            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="text-sm font-medium text-gray-700"
              >
                Reason for cancellation (optional)
              </label>

              <Textarea
                id="reason"
                rows={3}
                placeholder="Please provide a reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button ref={closeRef} className="hidden" />
          </DialogClose>
          <Button
            className="w-full"
            onClick={() => handleStatusChange(activeStatus)}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </span>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
