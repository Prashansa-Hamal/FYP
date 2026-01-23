import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { OrderStatus } from "@/types/enums";
import { OrderDetail } from "@/types/orderDetails";
import { getStatusConfig } from "@/utils/orders-helper";
import { CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ActionsTabProps {
  order: OrderDetail;
  onStatusChange: (status: OrderStatus) => void;
  isPending: boolean;
}

export function ActionsTab({
  order,
  onStatusChange,
  isPending,
}: ActionsTabProps) {
  const [activeStatus, setActiveStatus] = useState<OrderStatus>(order.status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Update Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Order Status
          </CardTitle>
          <CardDescription>
            Change the current status of this order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select New Status</label>
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
                const config = getStatusConfig(status);
                return (
                  <Button
                    key={status}
                    variant={activeStatus === status ? "default" : "outline"}
                    onClick={() => setActiveStatus(status as OrderStatus)}
                    className={`${
                      activeStatus === status
                        ? "bg-blue-500 hover:bg-blue-600"
                        : ""
                    } justify-start`}
                  >
                    {config.icon}
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <Button
            onClick={() => onStatusChange(activeStatus)}
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>Updating...</span>
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Process Payment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </CardTitle>
          <CardDescription>Record a payment for this order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(order.finalAmount)}
              </div>
            </div>
            {order.paymentStatus === "PAID" ? (
              <p className="text-2xl font-semibold text-green-500 text-center">
                Paid
              </p>
            ) : order.paymentStatus === "REFUNDED" ? (
              <p className="text-2xl font-semibold text-red-500 text-center">
                Cancelled
              </p>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["CASH", "CARD", "ONLINE", "WALLET"].map((method) => (
                      <Button key={method} variant="outline">
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Process Payment</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
