// components/invoice/invoice-preview.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { Printer, Download, FileText } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface InvoiceProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  tableNumber?: number;
  orderType: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantEmail?: string;
}

export function InvoicePreview({
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  customerPhone,
  tableNumber,
  orderType,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  totalAmount,
  paymentStatus,
  paymentMethod,
  restaurantName = "Dine Ease",
  restaurantAddress = "123 Main St, City, Country",
  restaurantPhone = "+977 9876543210",
  restaurantEmail = "dine@ease.com",
}: InvoiceProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${orderNumber}`,
  });

  const handleDownload = () => {
    // Generate PDF using jsPDF
    console.log("Download PDF");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-0 w-full justify-start font-normal"
        >
          <Printer className="h-4 w-4 mr-2" color="gray" />
          Print Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Invoice <br /> #{orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Print/Download buttons */}
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Invoice Content */}
          <div ref={componentRef} className="bg-white text-gray-900">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">{restaurantName}</h1>
                <p className="text-gray-600">{restaurantAddress}</p>
                <p className="text-gray-600">{restaurantPhone}</p>
                <p className="text-gray-600">{restaurantEmail}</p>
              </div>

              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                <p className="text-gray-600">#{orderNumber}</p>
                <p className="text-gray-600">
                  Date: {new Date(orderDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Time:{" "}
                  {new Date(orderDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer & Order Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
                <p className="font-medium">{customerName}</p>
                {customerEmail && (
                  <p className="text-gray-600">{customerEmail}</p>
                )}
                {customerPhone && (
                  <p className="text-gray-600">{customerPhone}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Order Details:</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-medium">
                      {orderType.replace("_", " ")}
                    </span>
                  </div>
                  {tableNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">{tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        paymentStatus === "COMPLETED"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                  {paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4">Order Items</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold">Item</th>
                    <th className="text-center py-3 px-4 font-semibold">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.specialInstructions && (
                            <div className="text-sm text-gray-600 italic">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="ml-auto w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600 text-sm">
              <p>Thank you for your business!</p>
              <p className="mt-2">
                For any questions, please contact us at {restaurantPhone}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
