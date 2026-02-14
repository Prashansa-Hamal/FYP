import { formatCurrency } from "@/lib/formatters";
import { ChefHat, Clock, Loader2, Minus, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "../ui/badge";
import { useState } from "react";

export const MenuItemCardWaiter = ({
  id,
  name,
  imageUrl,
  isAvailable,
  isVegetarian,
  isSpicy,
  description,
  price,
  preparationTime,
  calories,
  rating = 4.5,
}: any) => {
  const { addItem, getItemQuantity, isItemInCart, updateQuantity } = useCart();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setLoadingItemId(id);
    try {
      await addItem.mutateAsync({
        menuItemId: id,
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;

    setLoadingItemId(id);
    try {
      await updateQuantity.mutateAsync({
        menuItemId: id,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = () => {
    if (loadingItemId === id) return;
    handleQuantityChange(getItemQuantity(id) + 1);
  };

  const handleDecrease = () => {
    if (loadingItemId === id) return;
    handleQuantityChange(getItemQuantity(id) - 1);
  };

  const isLoading = loadingItemId === id;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      {/* Image Section */}
      <div className="relative h-80 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-amber-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!isAvailable && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              SOLD OUT
            </span>
          )}
          {isVegetarian && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              VEG
            </span>
          )}
          {isSpicy && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
              🔥 SPICY
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white text-black text-sm shadow font-medium">
            {formatCurrency(price)}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white/40 backdrop-blur-xs flex flex-col p-2">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-sm text-gray-900">{rating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-900 text-sm mb-1 line-clamp-2">
            {description || "Delicious item from our kitchen"}
          </p>

          {/* Details */}
          <div className="flex items-center justify-between text-sm text-gray-900 mb-2">
            {preparationTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{preparationTime} min</span>
              </div>
            )}
            {calories && (
              <div className="flex items-center gap-1">
                <span>🔥 {calories} cal</span>
              </div>
            )}
          </div>

          {/* Cart Actions */}
          {isAvailable && (
            <div className="flex flex-col h-full w-full justify-between items-center gap-1">
              {isItemInCart(id) ? (
                <div className="flex-col flex items-center w-full justify-between h-full gap-1">
                  <div className="flex items-center gap-1 sm:gap-2 w-full justify-between rounded p-1 border border-gray-200 sm:border-gray-300">
                    <Button
                      onClick={handleDecrease}
                      disabled={isLoading || getItemQuantity(id) <= 1}
                      size="sm"
                      className="rounded h-8 w-8 bg-[#f08167] text-white flex items-center justify-center hover:bg-[#e07159] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="min-w-[20px] text-center">
                      {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4 text-gray-500 mx-auto" />
                      ) : (
                        getItemQuantity(id)
                      )}
                    </span>

                    <Button
                      onClick={handleIncrease}
                      disabled={isLoading}
                      size="sm"
                      className="rounded h-8 w-8 bg-[#f08167] text-white flex items-center justify-center hover:bg-[#e07159] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading || !isAvailable}
                  className="bg-[#f08167] hover:bg-[#e07159] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Sold Out State */}
          {!isAvailable && (
            <div className="w-full text-center text-sm  text-red-600 font-medium">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
