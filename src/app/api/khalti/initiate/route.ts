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
  console.log("🚀 Khalti payment initiation started");
  console.log("Step 1: Starting...");

  try {
    // 1. Parse request body
    console.log("Step 2: Parsing request body...");
    const body = await req.json();
    console.log("📦 Request body:", body);

    const { orderId } = body;

    if (!orderId) {
      console.log("❌ Step 2.1: Order ID missing");
      return NextResponse.json(
        {
          success: false,
          message: "Order ID missing",
        },
        { status: 400 },
      );
    }
    console.log(" Step 2.2: Order ID present:", orderId);

    // 2. Fetch order with details
    console.log("Step 3: Fetching order from database...");
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    console.log("Step 3.1: Database query completed");

    if (!order) {
      console.log("❌ Step 3.2: Order not found in database");
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 400 },
      );
    }

    // Should check if order can accept payment
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "Order already paid",
        },
        { status: 400 },
      );
    }

    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: `Order is ${order.status.toLowerCase()}`,
        },
        { status: 400 },
      );
    }

    console.log(" Step 3.3: Order found:", {
      orderNumber: order.orderNumber,
      finalAmount: order.finalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: order.items?.length,
    });

    // Check if payment already exists and is completed
    console.log("Step 4: Checking existing payments...");
    const existingPayment = await db.payment.findFirst({
      where: {
        orderId,
        status: "PAID",
      },
    });

    if (existingPayment) {
      console.log("❌ Step 4.1: Order already paid:", existingPayment);
      return NextResponse.json(
        {
          success: false,
          message: "Order already paid",
        },
        { status: 400 },
      );
    }

    console.log(" Step 4.2: No existing paid payment found");

    // 3. Check secret key
    console.log("Step 5: Checking KHALTI_SECRET_KEY...");
    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      console.log("❌ Step 5.1: KHALTI_SECRET_KEY not found");
      return NextResponse.json(
        {
          success: false,
          error_key: "configuration_error",
          detail: "Khalti secret key not configured",
        },
        { status: 500 },
      );
    }
    console.log(
      " Step 5.2: KHALTI_SECRET_KEY found (length:",
      secretKey.length,
      ")",
    );

    // 4. Convert amount to paisa
    console.log("Step 6: Converting amount to paisa...");
    const amountInPaisa = Math.round(Number(order.finalAmount) * 100);
    console.log("💰 Amount in NPR:", order.finalAmount);
    console.log("💰 Amount in paisa:", amountInPaisa);

    // Validate minimum amount (Rs 10 = 1000 paisa)
    if (amountInPaisa < 1000) {
      console.log("❌ Step 6.1: Amount too low:", amountInPaisa);
      return NextResponse.json(
        {
          success: false,
          error_key: "validation_error",
          detail: "Amount must be at least NPR 10 (1000 paisa)",
        },
        { status: 400 },
      );
    }
    console.log(" Step 6.2: Amount validation passed");

    // 5. Build request payload
    console.log("Step 7: Building Khalti payload...");

    const amount_breakdown = [
      {
        label: "Subtotal",
        amount: Math.round(order.totalAmount * 100),
      },
      {
        label: "Tax",
        amount: Math.round(order.taxAmount * 100),
      },
    ];

    if (order.discountAmount > 0) {
      amount_breakdown.push({
        label: "Discount",
        amount: -Math.round(order.discountAmount * 100),
      });
    }

    const customer_info = order.user
      ? {
          name: order.user.name || "Customer",
          email: order.user.email,
          phone: order.user.phone || "",
        }
      : undefined;

    const product_details = buildKhaltiProductDetails(order.items || []);

    const merchant_extra = {
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      itemCount: order.items?.length || 0,
      specialInstructions: order.specialInstructions,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }

    const khaltiPayload = {
      return_url: `${baseUrl}/api/khalti/verify?orderId=${orderId}`,
      website_url: baseUrl,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: `Order #${order.orderNumber}`,
      ...(customer_info && { customer_info }),
      ...(amount_breakdown.length > 0 && { amount_breakdown }),
      ...(product_details.length > 0 && { product_details }),
      merchant_extra,
    };

    console.log("📤 Khalti payload prepared");
    console.log("Payload structure:", {
      hasReturnUrl: !!khaltiPayload.return_url,
      hasWebsiteUrl: !!khaltiPayload.website_url,
      amount: khaltiPayload.amount,
      hasCustomerInfo: !!khaltiPayload.customer_info,
      hasAmountBreakdown: !!khaltiPayload.amount_breakdown,
      hasProductDetails: !!khaltiPayload.product_details,
    });

    // 6. Use environment-specific API URL
    console.log("Step 8: Determining Khalti API URL...");
    const isProduction = process.env.NODE_ENV === "production";
    const khaltiApiUrl = isProduction
      ? "https://khalti.com/api/v2/epayment/initiate/"
      : "https://dev.khalti.com/api/v2/epayment/initiate/";

    console.log("🌐 Khalti API URL:", khaltiApiUrl);
    console.log("Environment:", isProduction ? "production" : "development");

    // 7. Make API call to Khalti
    console.log("Step 9: Making API call to Khalti...");
    console.log("Request headers:", {
      Authorization: `Key ${secretKey.substring(0, 10)}...`,
      "Content-Type": "application/json",
    });

    const response = await fetch(khaltiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(khaltiPayload),
    });

    console.log("Step 9.1: Khalti API response status:", response.status);
    console.log(
      "Step 9.2: Khalti API response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    // 8. Get response
    const responseText = await response.text();
    console.log("📥 Khalti raw response length:", responseText.length);
    console.log("📥 Khalti raw response:", responseText);

    // 9. Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { detail: responseText };
      }

      console.log("❌ Step 9.3: Khalti API error:", errorData);

      return NextResponse.json(
        {
          success: false,
          error_key: errorData.error_key || "api_error",
          detail: errorData.detail || "Khalti API error",
          status_code: response.status,
        },
        { status: response.status },
      );
    }

    // 10. Parse success response
    console.log("Step 10: Parsing success response...");
    const data = JSON.parse(responseText);
    console.log(" Khalti success response:", data);

    // 11. Store payment initiation in database
    console.log("Step 11: Storing payment in database...");
    try {
      const payment = await db.payment.create({
        data: {
          orderId: order.id,
          amount: order.finalAmount,
          paymentMethod: "KHALTI",
          status: "PENDING",
          transactionId: data.pidx,
          gatewayResponse: data,
        },
      });
      console.log("Payment record created:", payment.id);
    } catch (dbError) {
      console.log("❌ Step 11.1: Database error:", dbError);
      // Continue even if DB save fails? Probably not
      throw dbError;
    }

    // 12. Return payment details
    console.log("Step 12: Returning success response");
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
    console.log("💥 Server error at step:", error);
    return NextResponse.json(
      {
        success: false,
        error_key: "server_error",
        detail:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for testing
export async function GET() {
  const secretKey = process.env.KHALTI_SECRET_KEY;

  return NextResponse.json({
    service: "Khalti Payment API",
    version: "v2",
    endpoints: {
      initiate: "/api/khalti/initiate (POST)",
      verify: "/api/khalti/verify (GET)",
      lookup: "/api/khalti/lookup (POST)",
    },
    configuration: {
      secretKeyExists: !!secretKey,
      secretKeyFormat: secretKey
        ? {
            prefix: secretKey.substring(0, 15),
            isValid:
              secretKey.startsWith("test_secret_key_") ||
              secretKey.startsWith("live_secret_key_"),
            length: secretKey.length,
          }
        : "Not configured",
      apiUrl: "https://dev.khalti.com/api/v2",
      documentation: "https://docs.khalti.com/khalti-epayment/",
    },
    testCredentials: {
      khaltiIds: [
        "9800000000",
        "9800000001",
        "9800000002",
        "9800000003",
        "9800000004",
        "9800000005",
      ],
      mpin: "1111",
      otp: "987654",
    },
    notes: [
      "Use test_secret_key_ for sandbox",
      "Amount must be in paisa (multiply NPR by 100)",
      'Only status "Completed" should be treated as success',
      "Payment link expires in 60 minutes",
    ],
  });
}
