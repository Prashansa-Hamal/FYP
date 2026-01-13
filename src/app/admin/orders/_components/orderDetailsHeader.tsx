import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { OrderDetail, OrderItem } from "@/types/orderDetails";
import { getStatusConfig } from "@/utils/orders-helper";
import { Calendar, Edit, RefreshCw } from "lucide-react";

interface OrderHeaderProps {
  order: OrderDetail;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const statusConfig = getStatusConfig(order.status);

  const invoiceItems =
    order.items.map((item: OrderItem) => ({
      id: item.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions || null || undefined,
    })) || [];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Order #{order.orderNumber}
            <Badge
              className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <InvoicePreview
          orderNumber={order.orderNumber}
          orderDate={order.createdAt}
          customerName={order.user.name}
          customerEmail={order.user.email}
          customerPhone={order.user.phone as any}
          tableNumber={order.tableNumber as any}
          orderType={order.orderType}
          items={invoiceItems}
          subtotal={order.totalAmount}
          taxAmount={order.taxAmount}
          discountAmount={order.discountAmount}
          totalAmount={order.finalAmount}
          paymentStatus={order.paymentStatus}
          paymentMethod={order.paymentMethod}
        />
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Order
        </Button>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </div>
    </div>
  );
}
