import { Button } from "@/components/ui/button";
import Link from "next/link";

const MenuItems = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <h1>Admin Page</h1>
      <Button>
        <Link href="/admin/menu-items/new">Add Menu Item</Link>
      </Button>
    </div>
  );
};

export default MenuItems;
