import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Validation schema
const lookupSchema = z.object({
  pidx: z.string().min(1, "pidx is required"),
  orderId: z.string().optional(), // Optional but useful
});

export async function POST(req: Request) {
  console.log("🔍 Khalti payment lookup started");
  const startTime = Date.now();

  try {
    // 1. Parse and validate request body
    const body = await req.json();
    console.log("📦 Lookup request:", body);

    const validated = lookupSchema.safeParse(body);

    if (!validated.success) {
      console.log("❌ Validation error:", validated.error);
      return NextResponse.json(
        {
          success: false,
          error_key: "validation_error",
          detail: validated.error.message,
          errors: validated.error.message,
        },
        { status: 400 },
      );
    }

    const { pidx, orderId } = validated.data;

    // 2. Check secret key
    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      console.log("❌ KHALTI_SECRET_KEY not found");
      return NextResponse.json(
        {
          success: false,
          error_key: "configuration_error",
          detail: "Khalti secret key not configured",
        },
        { status: 500 },
      );
    }

    // 3. Check rate limiting (prevent abuse)
    // You can implement rate limiting here
    // const rateLimit = await checkRateLimit(req);
    // if (!rateLimit.allowed) { ... }

    // 4. Make lookup API call to Khalti
    const isProduction = process.env.NODE_ENV === "production";
    const khaltiApiUrl = isProduction
      ? "https://khalti.com/api/v2/epayment/lookup/"
      : "https://dev.khalti.com/api/v2/epayment/lookup/";

    const response = await fetch(khaltiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const responseText = await response.text();

    // 5. Handle Khalti API errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { detail: responseText };
      }

      console.log("❌ Khalti lookup API error:", errorData);

      // Log to monitoring
      // await logToMonitoring('khalti_lookup_error', { pidx, error: errorData });

      return NextResponse.json(
        {
          success: false,
          error_key: errorData.error_key || "lookup_error",
          detail: errorData.detail || "Payment lookup failed",
          status_code: response.status,
        },
        { status: response.status },
      );
    }

    // 6. Parse and validate Khalti response
    const data = JSON.parse(responseText);
    console.log("Khalti lookup success:", {
      status: data.status,
      total_amount: data.total_amount,
      transaction_id: data.transaction_id,
    });

    // 7. Return formatted response
    return NextResponse.json({
      success: true,
      pidx: data.pidx,
      total_amount: data.total_amount, // In paisa
      amount: data.amount, // In paisa (actual amount)
      status: data.status,
      transaction_id: data.transaction_id,
      fee: data.fee,
      refunded: data.refunded,
      purchase_order_id: data.purchase_order_id,
      purchase_order_name: data.purchase_order_name,
      created_on: data.created_on,
      updated_on: data.updated_on,
      // Convert to NPR for convenience
      total_amount_npr: data.total_amount / 100,
      amount_npr: data.amount / 100,
      fee_npr: data.fee / 100,
    });
  } catch (error) {
    console.log("💥 Lookup server error:", error);

    // Log to error tracking
    // if (process.env.SENTRY_DSN) { ... }

    return NextResponse.json(
      {
        success: false,
        error_key: "server_error",
        detail:
          error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(` Lookup completed in ${duration}ms`);
  }
}
