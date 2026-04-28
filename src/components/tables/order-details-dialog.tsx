"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  MapPin,
  Package,
  CreditCard,
  ChefHat,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PREPARING":
        return "bg-orange-100 text-orange-700";
      case "READY":
        return "bg-green-100 text-green-700";
      case "SERVED":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 rounded-2xl">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-2xl font-bold">
                  Order #{order.orderNumber}
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </DialogHeader>

            {/* Status Badges */}
            <div className="flex gap-2 mb-6">
              <Badge className={cn("px-3 py-1", getStatusColor(order.status))}>
                {order.status}
              </Badge>
              <Badge
                className={cn(
                  "px-3 py-1",
                  getPaymentStatusColor(order.paymentStatus),
                )}
              >
                Payment: {order.paymentStatus}
              </Badge>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Ordered:</span>
                <span className="font-medium">
                  {format(new Date(order.createdAt), "MMM dd, yyyy hh:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">
                  {order.orderType?.toLowerCase()}
                </span>
              </div>
              {order.tableNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Table:</span>
                  <span className="font-medium">{order.tableNumber}</span>
                </div>
              )}
              {order.user && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{order.user.name}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {item.quantity}x {item.menuItem?.name}
                        </span>
                        {item.isReady && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Ready
                          </Badge>
                        )}
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        Rs {item.totalPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rs {item.unitPrice} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Order Summary */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Rs {order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>Rs {order.taxAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>- Rs {order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span className="text-amber-600">Rs {order.finalAmount}</span>
              </div>
            </div>

            {/* Payment Info */}
            {order.payments && order.payments.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Payment Information
                  </h3>
                  {order.payments.map((payment: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">
                          {payment.method?.toLowerCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rs {payment.amount}</p>
                        <Badge
                          className={cn(
                            "text-xs",
                            getPaymentStatusColor(payment.status),
                          )}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Special Instructions */}
            {order.specialInstructions && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Special Instructions
                  </h3>
                  <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                    {order.specialInstructions}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
