import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  console.log("🔄 Khalti callback received");
  const startTime = Date.now();

  try {
    // 1. Get callback parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const callbackData = {
      pidx: searchParams.get("pidx"),
      status: searchParams.get("status"),
      transaction_id: searchParams.get("transaction_id"),
      tidx: searchParams.get("tidx"),
      amount: searchParams.get("amount"),
      mobile: searchParams.get("mobile"),
      purchase_order_id: searchParams.get("purchase_order_id"),
      purchase_order_name: searchParams.get("purchase_order_name"),
      total_amount: searchParams.get("total_amount"),
    };

    console.log("📦 Callback data:", callbackData);

    // 2. Validate required parameters
    if (!callbackData.pidx) {
      console.log("❌ Missing pidx in callback");
      return NextResponse.redirect(
        new URL(
          "/payment/failed?reason=invalid_callback",
          process.env.NEXT_PUBLIC_APP_URL,
        ),
      );
    }

    if (!callbackData.purchase_order_id) {
      console.log("❌ Missing purchase_order_id in callback");
      return NextResponse.redirect(
        new URL(
          "/payment/failed?reason=missing_order_id",
          process.env.NEXT_PUBLIC_APP_URL,
        ),
      );
    }

    // 3. Get secret key for lookup
    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      console.log("❌ KHALTI_SECRET_KEY not configured");
      return NextResponse.redirect(
        new URL(
          "/payment/failed?reason=configuration_error",
          process.env.NEXT_PUBLIC_APP_URL,
        ),
      );
    }

    // 4. Verify with lookup API (as per docs - this is CRITICAL)
    const isProduction = process.env.NODE_ENV === "production";
    const khaltiApiUrl = isProduction
      ? "https://khalti.com/api/v2/epayment/lookup/"
      : "https://dev.khalti.com/api/v2/epayment/lookup/";

    const lookupResponse = await fetch(khaltiApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx: callbackData.pidx }),
    });

    const lookupData = await lookupResponse.json();
    console.log("📥 Lookup verification result:", lookupData);

    if (!lookupResponse.ok) {
      console.log("❌ Lookup verification failed:", lookupData);
      return NextResponse.redirect(
        new URL(
          `/payment/failed?orderId=${callbackData.purchase_order_id}&reason=verification_failed`,
          process.env.NEXT_PUBLIC_APP_URL,
        ),
      );
    }

    // 5. Process based on verified status
    const orderId = callbackData.purchase_order_id;

    switch (lookupData.status) {
      case "Completed":
        console.log(" Payment completed and verified");

        // Update payment in database
        await db.$transaction(async (tx) => {
          // Update payment record
          await tx.payment.updateMany({
            where: {
              orderId,
              transactionId: callbackData.pidx,
            },
            data: {
              status: "PAID",
              paidAt: new Date(),
              gatewayResponse: lookupData,
            },
          });

          // Update order payment status
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED", // Move order to confirmed
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId:
                (await tx.order.findUnique({ where: { id: orderId } }))
                  ?.userId || "",
              orderId,
              type: "ORDER_PREPARING",
              title: "Payment Successful",
              message: `Payment of NPR ${(lookupData.total_amount / 100).toFixed(2)} received. Your order is confirmed.`,
            },
          });
        });

        // Redirect to success page
        return NextResponse.redirect(
          new URL(
            `/payment/success?` +
              `orderId=${orderId}&` +
              `transactionId=${lookupData.transaction_id}&` +
              `amount=${lookupData.total_amount / 100}&` +
              `pidx=${callbackData.pidx}`,
            process.env.NEXT_PUBLIC_APP_URL,
          ),
        );

      case "User canceled":
      case "Cancelled":
        console.log("🚫 Payment cancelled by user");

        // Before updating payment, ensure it exists
        const paymentExists = await db.payment.findFirst({
          where: {
            orderId,
            transactionId: callbackData.pidx,
          },
        });

        if (!paymentExists) {
          // Create payment record if it doesn't exist (for callback-first flow)
          await db.payment.create({
            data: {
              orderId,
              transactionId: callbackData.pidx,
              amount: lookupData.total_amount / 100,
              paymentMethod: "KHALTI",
              status: lookupData.status === "Completed" ? "PAID" : "PENDING",
              gatewayResponse: lookupData,
              paidAt: lookupData.status === "Completed" ? new Date() : null,
            },
          });
        }

        // Update payment as failed
        await db.payment.updateMany({
          where: {
            orderId,
            transactionId: callbackData.pidx,
          },
          data: {
            status: "FAILED",
            gatewayResponse: lookupData,
          },
        });

        return NextResponse.redirect(
          new URL(
            `/payment/failed?orderId=${orderId}&reason=cancelled`,
            process.env.NEXT_PUBLIC_APP_URL,
          ),
        );

      case "Pending":
        console.log("⏳ Payment still pending");

        // Update payment status to pending if needed
        await db.payment.updateMany({
          where: {
            orderId,
            transactionId: callbackData.pidx,
          },
          data: {
            status: "PENDING",
            gatewayResponse: lookupData,
          },
        });

        return NextResponse.redirect(
          new URL(
            `/payment/pending?orderId=${orderId}`,
            process.env.NEXT_PUBLIC_APP_URL,
          ),
        );

      case "Expired":
        console.log("⌛ Payment expired");

        await db.payment.updateMany({
          where: {
            orderId,
            transactionId: callbackData.pidx,
          },
          data: {
            status: "FAILED",
            gatewayResponse: lookupData,
          },
        });

        return NextResponse.redirect(
          new URL(
            `/payment/failed?orderId=${orderId}&reason=expired`,
            process.env.NEXT_PUBLIC_APP_URL,
          ),
        );

      default:
        console.log("⚠️ Unknown payment status:", lookupData.status);
        return NextResponse.redirect(
          new URL(
            `/payment/failed?orderId=${orderId}&status=${lookupData.status}`,
            process.env.NEXT_PUBLIC_APP_URL,
          ),
        );
    }
  } catch (error) {
    console.log("💥 Callback error:", error);

    // Log error to your error tracking service
    // if (process.env.SENTRY_DSN) { ... }

    return NextResponse.redirect(
      new URL(
        "/payment/failed?reason=server_error",
        process.env.NEXT_PUBLIC_APP_URL,
      ),
    );
  } finally {
    const duration = Date.now() - startTime;
    console.log(` Callback processed in ${duration}ms`);
  }
}
