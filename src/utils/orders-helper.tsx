import { IconPepper } from "@tabler/icons-react";
import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Clock,
  Leaf,
  Martini,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Utensils,
  XCircle,
} from "lucide-react";

// Get status configuration
export const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
  > = {
    PENDING: {
      label: "Pending",
      icon: <Clock className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    CONFIRMED: {
      label: "Confirmed",
      icon: <ShieldCheck className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    PREPARING: {
      label: "Preparing",
      icon: <ChefHat className="h-4 w-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    READY: {
      label: "Ready",
      icon: <Package className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    SERVED: {
      label: "Served",
      icon: <Truck className="h-4 w-4" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    COMPLETED: {
      label: "Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  };
  return (
    configs[status] || {
      label: status,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    }
  );
};

// Get payment status configuration
export const getPaymentStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
  > = {
    PENDING: {
      label: "Pending",
      icon: <Clock className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    PROCESSING: {
      label: "Processing",
      icon: <RefreshCw className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    COMPLETED: {
      label: "Paid",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    FAILED: {
      label: "Failed",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    REFUNDED: {
      label: "Refunded",
      icon: <RefreshCw className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  };
  return (
    configs[status] || {
      label: status,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    }
  );
};

// Get order type configuration
export const getOrderTypeConfig = (type: string) => {
  const configs: Record<
    string,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    DINE_IN: {
      label: "Dine In",
      icon: <Utensils className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800",
    },
    TAKEAWAY: {
      label: "Takeaway",
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "bg-green-100 text-green-800",
    },
    DELIVERY: {
      label: "Delivery",
      icon: <Truck className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800",
    },
  };
  return (
    configs[type] || {
      label: type,
      icon: <Package className="h-4 w-4" />,
      color: "bg-gray-100 text-gray-800",
    }
  );
};

// Get item badge based on properties
export const getItemBadges = (item: any) => {
  const badges = [];
  if (item.menuItem.isVegetarian)
    badges.push({
      icon: <Leaf className="h-3 w-3" />,
      text: "Veg",
      color: "bg-green-100 text-green-800",
    });
  if (item.menuItem.isSpicy)
    badges.push({
      icon: <IconPepper className="h-3 w-3" />,
      text: "Spicy",
      color: "bg-red-100 text-red-800",
    });
  if (item.menuItem.isAlcoholic)
    badges.push({
      icon: <Martini className="h-3 w-3" />,
      text: "Alcoholic",
      color: "bg-purple-100 text-purple-800",
    });
  return badges;
};
