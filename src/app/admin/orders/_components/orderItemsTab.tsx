import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Clock,
  Timer,
  Utensils,
} from "lucide-react";
import { format } from "date-fns";
import { getItemBadges } from "@/utils/orders-helper";
import { Badge } from "@/components/ui/badge";
import { OrderItem } from "@/types/orderDetails";
import { useUpdateOrderItem } from "@/hooks/useUpdateOrderItem";

interface OrderItemsTabProps {
  items: OrderItem[];
}

export function OrderItemsTab({ items }: OrderItemsTabProps) {
  const { mutate, isPending } = useUpdateOrderItem();

  const handleReady = (id: string) => {
    mutate({ id });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Order Items ({items.length})
        </CardTitle>
        <CardDescription>
          All items ordered with preparation status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const badges = getItemBadges(item);
            const isReady = item.isReady;

            return (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isReady
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isReady ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {item.menuItem.name}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              #{index + 1}
                            </span>
                          </h3>
                          <div className="flex gap-1">
                            {badges.map((badge, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={badge.color}
                              >
                                {badge.icon}
                                <span className="ml-1">{badge.text}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.menuItem.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <ChefHat className="h-3 w-3" />
                            {item.menuItem.preparationStation.replace("_", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {item.menuItem.preparationTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            {formatCurrency(item.unitPrice)} each
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.specialInstructions && (
                      <div className="mt-3 ml-13 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Special Instructions
                        </p>
                        <p className="text-sm mt-1 italic">
                          {item.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {formatCurrency(item.totalPrice)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="flex sm:justify-end gap-2">
                        <Badge
                          variant={isReady ? "default" : "outline"}
                          className={`${isReady ? "bg-green-100 text-green-700" : ""} text-xs`}
                        >
                          {isReady ? "Ready" : "Preparing"}
                        </Badge>
                        {item.readyAt && (
                          <Badge variant="outline" className="text-xs">
                            Ready at:{" "}
                            {format(new Date(item.readyAt), "hh:mm a")}
                          </Badge>
                        )}
                      </div>
                      {!isReady && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-green-200 hover:bg-green-300"
                          onClick={() => handleReady(item.id)}
                          disabled={isPending}
                        >
                          {isPending ? "Updating..." : "Mark as Ready"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
