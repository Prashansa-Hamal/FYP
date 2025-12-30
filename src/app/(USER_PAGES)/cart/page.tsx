"use client";

import Link from "next/link";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { CartItemCard } from "@/components/cards/cartItemCard";
import { CartPageSkeleton } from "@/components/skeletons/cartPageSkeleton";

export default function CartPage() {
  const { cartItems, isLoading, clearCart, getCartTotal, getItemCount } =
    useCart();

  if (isLoading) {
    return <CartPageSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Menu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 items-center flex justify-between flex-row gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getItemCount()} item{getItemCount() !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => clearCart.mutate()}
          disabled={clearCart.isPending}
          className="w-fit text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-5">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} {...item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-xl border bg-background shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-6 text-lg font-semibold tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(getCartTotal() * 0.13)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(getCartTotal() * 1.13)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 p-6 pt-0">
              <Button className="h-12 w-full text-base" asChild>
                <Link href="/checkout">
                  Place Order · {formatCurrency(getCartTotal() * 1.13)}
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Menu Search
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
