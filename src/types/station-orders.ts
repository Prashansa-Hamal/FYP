import { OrderStatus, OrderType, PreparationStation } from "./enums";

// Station order item from OrderStationAssignment
export interface StationOrderItem {
  assignmentId: string;
  orderItemId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  preparationTime: number;
  isReady: boolean;
  readyAt?: Date;
  stationStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
}

// Station progress for an order
export interface StationProgress {
  total: number;
  ready: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

// Complete station order (grouped from assignments)
export interface StationOrder {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: number;
  customerName: string;
  customerPhone?: string;
  createdAt: Date;
  estimatedReadyTime?: Date;
  specialInstructions?: string;
  stationProgress: StationProgress;
  items: StationOrderItem[];
  stationSubtotal: number;
  stationItemCount: number;
}

// API response structure
export interface StationOrdersResponse {
  success: boolean;
  station: PreparationStation;
  data: {
    pending: StationOrder[];
    ready: StationOrder[];
    all: StationOrder[];
  };
  summary: {
    totalOrders: number;
    pendingOrders: number;
    readyOrders: number;
    totalItems: number;
    pendingItems: number;
    inProgressItems: number;
    readyItems: number;
  };
  fetchedAt: string;
}
