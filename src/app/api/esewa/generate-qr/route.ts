// app/api/esewa/generate-qr/route.ts
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const { esewaId, amount, name, transactionId, note } = await request.json();

    // Validate inputs
    if (!esewaId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Esewa ID and amount are required." },
        { status: 400 }
      );
    }

    // Generate transaction ID if not provided
    const finalTransactionId =
      transactionId ||
      `TXN${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

    // Create eSewa QR data object (EXACT format from your example)
    const esewaQRData = {
      eSewa_id: esewaId.toString(), // Must match exact field name
      name: name || "Customer", // Name field
      amount: amount, // Optional: Add amount if needed
      tid: finalTransactionId, // Transaction ID
      note: note || "Payment", // Optional note
      timestamp: new Date().toISOString().split("T")[0], // Date in YYYY-MM-DD format
    };

    // Convert to JSON string for QR code
    const qrContent = JSON.stringify(esewaQRData);

    console.log("Generating QR with content:", qrContent);

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#0F5CA8", // eSewa blue
        light: "#FFFFFF",
      },
    });

    // Return response
    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      qrContent: qrContent, // For debugging
      qrData: esewaQRData, // The actual data object
      scanInstructions:
        "Open eSewa app → Tap 'Scan QR' → Point camera at QR code",
      note: "QR contains JSON data in eSewa format: {eSewa_id, name, amount, tid, note, timestamp}",
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate QR code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
