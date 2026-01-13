import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationStation: string;
  preparationTime: number;
  isVegetarian: boolean;
  isSpicy: boolean;
  isAlcoholic: boolean;
  imageUrl: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string | null;
  isReady: boolean;
  readyAt: string | null;
  createdAt: string;
  updatedAt: string;
  menuItem: MenuItem;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

interface OrderStatistics {
  totalItems: number;
  readyItems: number;
  preparationProgress: number;
  paidAmount: number;
  balance: number;
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  tableNumber: number | null;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  deliveryAddressId: string | null;
  specialInstructions: string | null;

  estimatedReadyTime: string | null;
  readyAt: string | null;
  servedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;

  createdAt: string;
  updatedAt: string;

  user: User;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress | null;
  payments: Payment[];
  statistics: OrderStatistics;
}
