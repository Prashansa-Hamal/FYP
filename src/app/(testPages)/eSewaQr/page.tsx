// app/esewa-qr/page.tsx
"use client";

import { useState } from "react";

interface QRData {
  success: boolean;
  qrCode: string;
  qrContent: string;
  qrData: {
    eSewa_id: string;
    name: string;
    amount: number;
    tid: string;
    note: string;
    timestamp: string;
  };
  scanInstructions: string;
  note: string;
}

export default function EsewaQRGeneratorPage() {
  const [formData, setFormData] = useState({
    esewaId: "9824229946",
    amount: 100,
    name: "Sunil Sah Kalwar",
    note: "Payment for services",
    transactionId: `TXN${Date.now()}`,
  });

  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRawData, setShowRawData] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setQrData(null);

    try {
      // Validate eSewa ID (should be 10 digits starting with 98)
      if (!/^98\d{8}$/.test(formData.esewaId)) {
        throw new Error(
          "Invalid eSewa ID. Must be 10 digits starting with 98."
        );
      }

      // Validate amount
      if (formData.amount < 1) {
        throw new Error("Amount must be at least रु 1");
      }

      // Validate name
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }

      const response = await fetch("/api/esewa/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          esewaId: formData.esewaId,
          amount: formData.amount,
          name: formData.name,
          transactionId: formData.transactionId,
          note: formData.note,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrData(data);
      console.log(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrData?.qrCode) return;

    const link = document.createElement("a");
    link.href = qrData.qrCode;
    link.download = `esewa-payment-${formData.transactionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQRData = () => {
    if (!qrData?.qrContent) return;

    navigator.clipboard
      .writeText(qrData.qrContent)
      .then(() => alert("QR data copied to clipboard!"))
      .catch(() => alert("Failed to copy"));
  };

  const handleReset = () => {
    setFormData({
      esewaId: "9824229946",
      amount: 100,
      name: "Sunil Sah Kalwar",
      note: "Payment for services",
      transactionId: `TXN${Date.now()}`,
    });
    setQrData(null);
    setError("");
  };

  const formatJSON = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              eSewa QR Code Generator
            </h1>
          </div>
          <p className="text-gray-600">
            Generate QR codes that work with eSewa app
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Uses official eSewa QR format
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Enter Payment Details
              </h2>
            </div>

            <form onSubmit={handleGenerateQR} className="space-y-6">
              <div className="space-y-4">
                {/* eSewa ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    eSewa ID *<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">
                          ID
                        </span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="esewaId"
                      value={formData.esewaId}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="9824229946"
                      pattern="98\d{8}"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    10-digit eSewa ID (starts with 98)
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter name for transaction"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (रु) *<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      रु
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Note
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="What is this payment for?"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Transaction ID"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          transactionId: `TXN${Date.now()}${Math.random()
                            .toString(36)
                            .substr(2, 4)
                            .toUpperCase()}`,
                        }))
                      }
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Generate ID
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Unique ID for tracking this transaction
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">Error</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Generate QR Code
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Example JSON */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="font-medium text-gray-700">QR Code Format:</h3>
              </div>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                <pre>
                  {`{
  "eSewa_id": "9824229946",
  "name": "Sunil Sah Kalwar",
  "amount": 100,
  "tid": "TXN123456",
  "note": "Payment for services",
  "timestamp": "2024-01-15"
}`}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This exact JSON format is used in eSewa QR codes
              </p>
            </div>
          </div>

          {/* Right: QR Code Display */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Generated QR Code
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {showRawData ? "Hide JSON" : "Show JSON"}
                </button>
              </div>
            </div>

            {qrData ? (
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl">
                  <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-200">
                    <img
                      src={qrData.qrCode}
                      alt="eSewa QR Code"
                      className="w-64 h-64"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg w-full max-w-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Ready to Scan
                        </p>
                        <p className="text-sm text-green-600">
                          {qrData.scanInstructions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">
                    Payment Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">eSewa ID</p>
                      <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border">
                        {qrData.qrData.eSewa_id}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Amount</p>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-lg font-bold text-green-700">
                          रु {qrData.qrData.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Name", value: qrData.qrData.name },
                      { label: "Transaction ID", value: qrData.qrData.tid },
                      { label: "Note", value: qrData.qrData.note },
                      { label: "Date", value: qrData.qrData.timestamp },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-right">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download QR
                    </button>
                    <button
                      onClick={handleCopyQRData}
                      className="flex-1 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Copy JSON Data
                    </button>
                  </div>
                </div>

                {/* Show Raw JSON Data */}
                {showRawData && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        QR Code JSON Data
                      </p>
                      <span className="text-xs text-gray-500">
                        This is what's in the QR code
                      </span>
                    </div>
                    <div className="p-3 bg-gray-900 rounded overflow-x-auto">
                      <pre className="text-xs text-green-400">
                        {formatJSON(qrData.qrData)}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This JSON format is exactly what eSewa app expects
                    </p>
                  </div>
                )}

                {/* Validity Note */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-yellow-800">
                        QR Code is Valid
                      </p>
                      <p className="text-sm text-yellow-600">
                        This QR code should work with the eSewa app. Scan it to
                        make a payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-3">
                  No QR Code Generated Yet
                </h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Enter payment details on the left and click "Generate QR Code"
                  to create a scannable eSewa payment QR.
                </p>
                <div className="text-sm text-gray-400">
                  The QR will contain JSON data in eSewa's official format
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>Note:</strong> This QR code generator creates QR codes
              with JSON data that eSewa app can read. Make sure you have the
              latest eSewa app installed.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Valid eSewa format
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Includes required fields
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                JSON data structure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
