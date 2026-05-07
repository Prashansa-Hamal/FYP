import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = await db.payment.groupBy({
    by: ["paymentMethod"],
    _count: true,
    _sum: {
      amount: true,
    },
  });

  const totalPayments = payments.reduce((sum, p) => sum + p._count, 0);
  const totalAmount = payments.reduce(
    (sum, p) => sum + (p._sum.amount || 0),
    0,
  );

  // Get success rates
  const successRates = await Promise.all(
    payments.map(async (payment) => {
      const successful = await db.payment.count({
        where: {
          paymentMethod: payment.paymentMethod,
          status: "PAID",
        },
      });

      return {
        method: payment.paymentMethod,
        successRate:
          payment._count > 0 ? (successful / payment._count) * 100 : 0,
      };
    }),
  );

  const data = payments.map((payment) => {
    const rate = successRates.find((r) => r.method === payment.paymentMethod);

    return {
      method: payment.paymentMethod,
      count: payment._count,
      totalAmount: payment._sum.amount || 0,
      percentage: (payment._count / totalPayments) * 100,
      successRate: rate?.successRate || 0,
    };
  });

  return NextResponse.json({ data });
}
