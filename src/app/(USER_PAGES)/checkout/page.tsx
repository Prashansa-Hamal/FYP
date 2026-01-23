import { CartSummarySkeleton } from "@/components/skeletons/cartSummarySkeleton";
import { Suspense } from "react";
import CartSummaryContent from "./_components/cartSummaryContent ";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CartSummarySkeleton />}>
      <CartSummaryContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
