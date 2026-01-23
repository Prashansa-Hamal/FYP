"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrderDetail, useUpdateOrderStatus } from "@/hooks/useOrders";
import { OrderDetailsSkeleton } from "@/components/skeletons/orderDetailsSkeleton";
import NotFoundComponent from "@/components/not-found";
import { toast } from "sonner";
import { useState } from "react";

import { OverviewTab } from "./overviewTab";
import { CancelOrderDialog } from "@/components/orders/cancelOrdersDialog";
import { OrderItemsTab } from "./orderItemsTab";
import { TimelineTab } from "./timelineTab";
import { PaymentsTab } from "./paymentsTab";
import { ActionsTab } from "./actionTab";
import { OrderDetail } from "@/types/orderDetails";
import { OrderHeader } from "./orderDetailsHeader";
import { OrderStatus } from "@/types/enums";

export function OrderDetailsClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useOrderDetail(id);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  console.log(data);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === "CANCELLED") {
      setShowCancelModal(true);
      return;
    }

    updateStatus(
      {
        id: id,
        status: newStatus,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Status updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update status");
        },
      },
    );
  };

  const handleCancelOrder = () => {
    updateStatus(
      {
        id: id,
        status: "CANCELLED",
        cancellationReason: cancellationReason || "No reason provided",
      },
      {
        onSuccess: () => {
          toast.success("Order cancelled successfully");
          setShowCancelModal(false);
          setCancellationReason("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to cancel order");
        },
      },
    );
  };

  // Handle loading and error states
  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError) return <NotFoundComponent />;
  if (!data) return <NotFoundComponent />;

  const order = data as OrderDetail;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <OrderHeader order={order} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Order Items</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab order={order} />
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <OrderItemsTab items={order.items} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab payments={order.payments || []} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <TimelineTab order={order} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <ActionsTab
            order={order}
            onStatusChange={handleStatusChange}
            isPending={isPending}
          />
        </TabsContent>
      </Tabs>

      <CancelOrderDialog
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        onConfirm={handleCancelOrder}
        isPending={isPending}
        status={order.status}
      />
    </div>
  );
}
