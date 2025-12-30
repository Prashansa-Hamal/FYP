"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CartItemCard } from "./cards/cartItemCard";

interface CartDrawerProps {
  className?: string;
}

export function CartDrawer({ className }: CartDrawerProps) {
  const {
    cartItems,
    getCartTotal,
    getItemCount,
    isLoading: isCartLoading,
    clearCart,
  } = useCart();

  const [isOpen, setIsOpen] = useState(false);

  const itemCount = getItemCount();
  const cartTotal = getCartTotal();
  const hasItems = cartItems.length > 0;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative hover:bg-transparent", className)}
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-background"
              variant="destructive"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-scroll pb-12">
          {/* Custom handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-2 mb-2" />

          <DrawerHeader className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-bold text-gray-900">
                    Your Cart
                  </DrawerTitle>
                  <DrawerDescription>
                    {hasItems
                      ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
                      : "Your cart is empty"}
                  </DrawerDescription>
                </div>
              </div>
              {hasItems && (
                <Button
                  variant="outline"
                  onClick={() => clearCart.mutate()}
                  disabled={clearCart.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              )}
            </div>
          </DrawerHeader>

          {/* Make this container take available height and enable scrolling */}
          <div className="flex-1 overflow-hidden px-4 sm:px-6">
            <ScrollArea className="h-full">
              {isCartLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !hasItems ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Empty Cart</h3>
                  <p className="text-gray-500 mb-6">Add items to get started</p>
                  <DrawerClose asChild>
                    <Button asChild>
                      <Link href="/">Browse Menu</Link>
                    </Button>
                  </DrawerClose>
                </div>
              ) : (
                <div className="space-y-3 h-fit py-2">
                  {cartItems.map((item) => (
                    <CartItemCard {...item} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {hasItems && (
            <DrawerFooter className="px-4 sm:px-6 border-t">
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerClose asChild>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/cart">View Cart</Link>
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button asChild className="flex-1">
                      <Link href="/checkout">
                        Place Order <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
