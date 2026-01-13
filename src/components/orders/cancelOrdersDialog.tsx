import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cancellationReason: string;
  setCancellationReason: (value: string) => void;
  onConfirm: () => void;
  isPending?: boolean;
  status: string;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  cancellationReason,
  setCancellationReason,
  onConfirm,
  isPending,
  status,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={status !== "CANCELLED" && open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium text-gray-700">
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

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 w-full"
          >
            {isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
