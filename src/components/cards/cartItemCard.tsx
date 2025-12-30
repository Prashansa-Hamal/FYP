import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { CartItem } from "@/types/cart";
import { Loader2, Minus, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export const CartItemCard = ({ ...item }: CartItem) => {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (
    menuItemId: string,
    newQuantity: number
  ) => {
    setIsUpdating(true);
    try {
      await updateQuantity.mutateAsync({ menuItemId, quantity: newQuantity });
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (menuItemId: string) => {
    setIsUpdating(true);

    try {
      await removeItem.mutateAsync(menuItemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = (menuItemId: string, currentQuantity: number) => {
    handleQuantityChange(menuItemId, currentQuantity + 1);
  };

  const handleDecrease = (menuItemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      handleRemoveItem(menuItemId);
    } else {
      handleQuantityChange(menuItemId, currentQuantity - 1);
    }
  };
  return (
    <div className="flex gap-4 rounded-xl border bg-white p-4 transition hover:shadow-sm">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
        {item.menuItem?.imageUrl ? (
          <Image
            src={item.menuItem.imageUrl}
            alt={item.menuItem.name || ""}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-900">
              {item.menuItem?.name}
            </h4>
            <p className="text-xs text-gray-500">
              {formatCurrency(item.menuItem?.price)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-500"
            onClick={() => handleRemoveItem(item.menuItemId)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Bottom */}
        <div className="mt-3 flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center overflow-hidden rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleDecrease(item.menuItemId, item.quantity)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>

            <div className="flex h-9 w-10 items-center justify-center text-sm font-medium">
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                item.quantity
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleIncrease(item.menuItemId, item.quantity)}
              disabled={isUpdating}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(item.menuItem.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
