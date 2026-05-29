import crypto from "crypto";
import {
  EsewaPaymentHashParams,
  EsewaPaymentHashResponse,
  DecodedData,
  EsewaPaymentResponse,
  VerifyPaymentResponse,
} from "@/types/esewa";

/**
 * Generates HMAC-SHA256 hash for eSewa payment
 * Server-side function (uses Node.js crypto)
 */
export const getEsewaPaymentHash = async ({
  amount,
  transaction_uuid,
}: EsewaPaymentHashParams): Promise<EsewaPaymentHashResponse> => {
  try {
    const productCode = process.env.NEXT_PUBLIC_ESEWA_PRODUCT_CODE;
    const secretKey = process.env.ESEWA_SECRET_KEY;

    if (!productCode) {
      throw new Error("NEXT_PUBLIC_ESEWA_PRODUCT_CODE is not defined");
    }
    if (!secretKey) {
      throw new Error("ESEWA_SECRET_KEY is not defined");
    }

    const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`;

    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    return {
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };
  } catch (error) {
    console.log("Error generating eSewa payment hash:", error);
    throw error;
  }
};

/**
 * Verifies eSewa payment using the encoded data from callback
 * Server-side function using fetch API instead of axios
 */
export const verifyEsewaPayment = async (
  encodedData: string,
): Promise<VerifyPaymentResponse> => {
  try {
    // Decoding base64 code received from eSewa
    let decodedData: DecodedData = JSON.parse(
      Buffer.from(encodedData, "base64").toString(),
    );

    const productCode = process.env.NEXT_PUBLIC_ESEWA_PRODUCT_CODE;
    const secretKey = process.env.ESEWA_SECRET_KEY;

    if (!productCode) {
      throw new Error("NEXT_PUBLIC_ESEWA_PRODUCT_CODE is not defined");
    }
    if (!secretKey) {
      throw new Error("ESEWA_SECRET_KEY is not defined");
    }

    // Generate signature for verification
    const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${productCode},signed_field_names=${decodedData.signed_field_names}`;

    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    console.log("Generated hash:", hash);
    console.log("Received signature:", decodedData.signature);

    // Verify hash matches
    if (hash !== decodedData.signature) {
      return {
        success: false,
        message: "Invalid Info - Signature mismatch",
        decodedData,
      };
    }

    // Build the verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${productCode}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`;

    console.log("Verification URL:", verificationUrl);

    // Make API request to eSewa using fetch (replaced axios)
    const response = await fetch(verificationUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `eSewa verification API responded with status: ${response.status}`,
      );
    }

    const responseData = await response.json();

    console.log("eSewa verification response:", responseData);

    // Verify response data
    if (
      responseData.status !== "COMPLETE" ||
      responseData.transaction_uuid !== decodedData.transaction_uuid ||
      Number(responseData.total_amount) !== Number(decodedData.total_amount)
    ) {
      return {
        success: false,
        message: "Invalid Info - Response data mismatch",
        response: responseData,
        decodedData,
      };
    }

    return {
      success: true,
      message: "Payment verified successfully",
      response: responseData,
      decodedData,
    };
  } catch (error) {
    console.log("Error verifying eSewa payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
