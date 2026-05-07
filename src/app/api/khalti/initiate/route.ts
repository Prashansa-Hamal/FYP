import db from "@/lib/db";
import { OrderItem } from "@/types/orders";
import { NextResponse } from "next/server";

interface KhaltiProductDetail {
  identity: string;
  name: string;
  total_price: number;
  quantity: number;
  unit_price: number;
}

function buildKhaltiProductDetails(items: OrderItem[]): KhaltiProductDetail[] {
  return items.map((item) => ({
    identity: item.menuItemId,
    name: item.menuItem.name,
    quantity: item.quantity,
    unit_price: Math.round(item.unitPrice * 100),
    total_price: Math.round(item.totalPrice * 100),
  }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 },
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { menuItem: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Order already paid" },
        { status: 400 },
      );
    }

    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, message: `Order is ${order.status.toLowerCase()}` },
        { status: 400 },
      );
    }

    // IDEMPOTENCY + RACE CONDITION FIX:
    // If a PENDING Khalti payment with a pidx already exists for this order,
    // return that existing payment URL instead of calling Khalti again.
    // This handles: double-clicks, network retries, and concurrent requests.
    const existingPendingPayment = await db.payment.findFirst({
      where: {
        orderId,
        paymentMethod: "KHALTI",
        status: "PENDING",
        transactionId: { not: null },
      },
    });

    if (existingPendingPayment?.paymentUrl) {
      return NextResponse.json({
        success: true,
        pidx: existingPendingPayment.transactionId,
        payment_url: existingPendingPayment.paymentUrl,
        order_id: order.id,
        order_number: order.orderNumber,
      });
    }

    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Khalti not configured" },
        { status: 500 },
      );
    }

    const amountInPaisa = Math.round(Number(order.finalAmount) * 100);
    if (amountInPaisa < 1000) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least NPR 10 (1000 paisa)" },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }

    const amount_breakdown = [
      { label: "Subtotal", amount: Math.round(order.totalAmount * 100) },
      { label: "Tax", amount: Math.round(order.taxAmount * 100) },
      ...(order.discountAmount > 0
        ? [{ label: "Discount", amount: -Math.round(order.discountAmount * 100) }]
        : []),
    ];

    const customer_info = order.user
      ? {
          name: order.user.name || "Customer",
          email: order.user.email,
          phone: order.user.phone || "",
        }
      : undefined;

    const khaltiPayload = {
      return_url: `${baseUrl}/api/khalti/verify?orderId=${orderId}`,
      website_url: baseUrl,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: `Order #${order.orderNumber}`,
      ...(customer_info && { customer_info }),
      amount_breakdown,
      product_details: buildKhaltiProductDetails(order.items || []),
      merchant_extra: {
        tableNumber: order.tableNumber,
        orderType: order.orderType,
        itemCount: order.items?.length || 0,
      },
    };

    const khaltiApiUrl =
      process.env.NODE_ENV === "production"
        ? "https://khalti.com/api/v2/epayment/initiate/"
        : "https://dev.khalti.com/api/v2/epayment/initiate/";

    const response = await fetch(khaltiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(khaltiPayload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData: { error_key?: string; detail?: string };
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { detail: responseText };
      }
      return NextResponse.json(
        {
          success: false,
          error_key: errorData.error_key || "api_error",
          detail: errorData.detail || "Khalti API error",
        },
        { status: response.status },
      );
    }

    const data = JSON.parse(responseText);

    // Store payment with paymentUrl so future duplicate requests can return it
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: order.finalAmount,
        paymentMethod: "KHALTI",
        status: "PENDING",
        transactionId: data.pidx,
        paymentUrl: data.payment_url,
        gatewayResponse: data,
      },
    });

    return NextResponse.json({
      success: true,
      pidx: data.pidx,
      payment_url: data.payment_url,
      expires_at: data.expires_at,
      expires_in: data.expires_in,
      order_id: order.id,
      order_number: order.orderNumber,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const secretKey = process.env.KHALTI_SECRET_KEY;
  return NextResponse.json({
    service: "Khalti Payment API",
    version: "v2",
    configuration: {
      secretKeyConfigured: !!secretKey,
      apiUrl: "https://dev.khalti.com/api/v2",
    },
    testCredentials: {
      khaltiIds: ["9800000000", "9800000001", "9800000002"],
      mpin: "1111",
      otp: "987654",
    },
  });
}
