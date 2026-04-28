import { NextResponse } from "next/server";
import { verifyEsewaPayment } from "@/lib/esewa";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { encodedData } = body;

    console.log("Verify payment request received");

    if (!encodedData) {
      return NextResponse.json(
        { success: false, message: "Missing encoded data" },
        { status: 400 },
      );
    }

    // Verify the payment
    const verificationResult = await verifyEsewaPayment(encodedData);

    console.log("Verification result:", verificationResult);

    if (verificationResult.success) {
      // Payment is verified - update your database here
      // Example: await updateOrderStatus(verificationResult.decodedData?.transaction_uuid, "paid")

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: verificationResult,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: verificationResult.message || "Payment verification failed",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error in verify endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
