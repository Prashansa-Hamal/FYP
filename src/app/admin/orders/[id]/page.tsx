import { OrderDetailsClient } from "../_components/orderDetailsClient";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <OrderDetailsClient id={id} />;
}
