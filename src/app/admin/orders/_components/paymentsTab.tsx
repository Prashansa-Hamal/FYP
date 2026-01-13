import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Badge, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Payment } from "@/types/orderDetails";
import { PaymentStatus } from "@/generated/prisma/enums";

interface PaymentsTabProps {
  payments: Payment[];
}

export function PaymentsTab({ payments }: PaymentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          All payment transactions for this order
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          payment.status === PaymentStatus.PAID
                            ? "bg-green-100"
                            : payment.status === "PENDING"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-5 w-5 ${
                            payment.status === PaymentStatus.PAID
                              ? "text-green-600"
                              : payment.status === "PENDING"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {payment.paymentMethod} Payment
                          {payment.transactionId && (
                            <span className="ml-2 text-sm font-mono text-muted-foreground">
                              ({payment.transactionId.slice(0, 8)})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt), "PPpp")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-2xl font-bold">
                      {formatCurrency(payment.amount)}
                    </div>
                    <Badge
                      className={
                        payment.status === PaymentStatus.PAID
                          ? "bg-green-100 text-green-800"
                          : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
            <p className="text-muted-foreground mb-6">
              No payment transactions have been recorded for this order.
            </p>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
