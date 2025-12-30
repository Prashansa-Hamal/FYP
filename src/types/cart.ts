export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

export interface CartApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
