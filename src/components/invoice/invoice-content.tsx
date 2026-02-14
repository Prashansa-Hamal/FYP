import { useLatestTableOrder } from "@/hooks/useTableOrder";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

export function InvoiceContent({ tableNumber }: { tableNumber?: number }) {
  const { data, isLoading, error } = useLatestTableOrder(tableNumber);

  console.log("Latest order for table", tableNumber, data);

  if (isLoading) return <p>Loading invoice...</p>;
  if (error) return <p>Failed to load invoice</p>;

  const order = data?.data;

  if (!order) {
    return (
      <p className="text-sm text-muted-foreground">
        No active order for this table
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <div className="flex flex-col">
          <span>Order ID</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <Button
          size="sm"
          className="bg-[#f08167] hover:bg-[#e07159] text-sm font-normal"
        >
          <Plus className="w-4 h-4" />
          Add More
        </Button>
      </div>

      <div className="">
        {order.items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 
               bg-white rounded-lg  
                p-1"
          >
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <Image
                src={item.menuItem?.imageUrl}
                alt={item.menuItem?.name || "Item image"}
                width={48}
                height={48}
                className="rounded-md object-cover aspect-square bg-gray-100"
              />

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {item.menuItem?.name || item.name}
                </span>

                <span className="text-xs text-gray-500">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="text-sm font-semibold text-gray-900">
              Rs. {(item.menuItem?.price ?? 0) * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex flex-col justify-between ">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span>Rs. {order.totalAmount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Tax</span>
          <span>Rs. {order.taxAmount}</span>
        </div>
        <div className="flex justify-between items-center font-semibold">
          <span>Total</span>
          <span>Rs. {order.finalAmount}</span>
        </div>
      </div>
    </div>
  );
}
