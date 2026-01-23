import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";

// types/order.ts
export interface PlaceOrderRequest {
  orderType?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber?: number;
  deliveryAddressId?: string;
  specialInstructions?: string;
  paymentMethod?: "CASH" | "CARD" | "ONLINE" | "WALLET";
}

export interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    orderType: string;
    tableNumber?: number;
    finalAmount: number;
    estimatedReadyTime: string;
    itemCount: number;
    items: OrderItemSummary[];
    createdAt: string;
  };
  nextSteps?: string[];
  unavailableItems?: string[];
  error?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  tableNumber?: number;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  specialInstructions?: string;

  // Related data
  userName: string;
  userEmail: string;
  userPhone?: string;
  itemCount: number;
  quantity: number;
  items: OrderItem[];
  payments: Payment[];
  deliveryAddress?: Address;

  // Timestamps
  estimatedReadyTime?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | string[];
  paymentStatus?: string | string[];
  orderType?: string | string[];
  startDate?: string;
  endDate?: string;
  userId?: string;
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  createdAt: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  user: UserDetails;
  tableNumber?: number;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime?: string;
  readyAt?: string;
  servedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  deliveryAddress: DeliveryAddress;
  specialInstructions: string;
  statistics?: {
    totalItems: number;
    readyItems: number;
    preparationProgress: number;
    paidAmount: number;
    balance: number;
  };
}

export interface OrderDetailResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UpdateOrderStatusParams {
  id: string;
  status: OrderStatus;
  cancellationReason?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    status: OrderStatus;
    cancellationReason?: string | null;
  };
}

export interface UpdateOrderPaymentStatusParams {
  id: string;
  paymentMethod: PaymentMethod;
}
