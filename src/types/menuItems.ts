import { ItemCategory, PreparationStation } from "@/generated/prisma/enums";

export type CreateMenuItemInput = {
  name: string;
  description?: string;
  price: number;
  category: ItemCategory;
  preparationStation: PreparationStation;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isAlcoholic?: boolean;
  preparationTime: number;
  imageUrl?: string;
  calories?: number;
  ingredients: string[];
  tags: string[];
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export interface MenuItemFilters {
  category?: ItemCategory;
  preparationStation?: PreparationStation;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MenuItemApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
