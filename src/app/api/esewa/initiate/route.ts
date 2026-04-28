import { NextResponse } from "next/server";
import { getEsewaPaymentHash } from "@/lib/esewa";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { totalPrice, transactionId } = body;

    console.log("Initiate payment request:", { totalPrice, transactionId });

    // Validate inputs
    if (!totalPrice || !transactionId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get payment hash from eSewa
    const paymentHash = await getEsewaPaymentHash({
      amount: totalPrice,
      transaction_uuid: transactionId,
    });

    console.log("Payment hash generated:", paymentHash);

    // Return payment details to client
    return NextResponse.json({
      success: true,
      payment: paymentHash,
      // Include transactionId for reference
      transactionId: transactionId,
    });
  } catch (error) {
    console.error("Error initiating eSewa payment:", error);
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
