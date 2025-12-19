import { MenuItem } from "@/generated/prisma/client";
import { Minus, Plus } from "lucide-react";
import { Activity } from "react";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/formatters";

export const MenuItemCard = ({
  id,
  isAvailable,
  imageUrl,
  name,
  tags,
  description,
  price,
}: MenuItem) => {
  return (
    <div
      key={id}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={imageUrl!}
          alt={name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full text-sm">
              Unavailable
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
          {isAvailable && (
            <div className="flex flex-col h-full justify-between items-center gap-1">
              {/* <Button className="w-10 h-10 rounded-full bg-[#f08167] text-white flex items-center justify-center hover:bg-[#e07159] transition-colors shadow-md">
                <Plus className="w-5 h-5" />
              </Button> */}
              <div className="flex-col flex items-center justify-between h-full gap-1">
                <div className="flex items-center gap-1 sm:gap-2 rounded-full p-1 border border-gray-200 sm:border-gray-300">
                  <Button
                    size="sm"
                    className="rounded-full h-8 w-8 bg-[#f08167] text-white flex items-center justify-center hover:bg-[#e07159] transition-colors shadow-md"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span>10</span>
                  <Button
                    size="sm"
                    className="rounded-full h-8 w-8 bg-[#f08167] text-white flex items-center justify-center hover:bg-[#e07159] transition-colors shadow-md"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
                <span className="text-[#f08167]">{formatCurrency(price)}</span>
              </div>
            </div>
          )}
        </div>
        <Activity mode={isAvailable ? "hidden" : "visible"}>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 sm:border-gray-300">
            <span className="text-[#f08167]">${price.toFixed(2)}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        </Activity>
      </div>
    </div>
  );
};
