interface MenuCategoryCardProps {
  id: number;
  image: string;
  title: string;
  description: string;
  type: string;
}

export const MenuCategoryCard = ({
  image,
  title,
  description,
  type,
}: MenuCategoryCardProps) => {
  return (
    <div className="group relative h-[120px] sm:h-[180px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0  gap-1 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col items-center justify-end p-2 sm:p-5">
        <h2 className="text-white text-lg leading-5 sm:text-2xl text-center">
          {title}
        </h2>
        <p className="text-white/90 text-xs sm:text-sm text-center sm:opacity-0 hidden sm:flex group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>
        <div className="sm:px-3 sm:py-1 h-5 sm:h-7 items-center justify-center flex px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
          <span className="text-white text-[10px] sm:text-[14px]">{type}</span>
        </div>
      </div>
    </div>
  );
};
