import { Metadata } from "next";
import MenuItemDetaisCard from "../_components/menuItemDetailsCard";

interface MenuItemAdminPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MenuItemAdminPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Manage Menu Item | Admin Dashboard`,
    description: `Admin panel for managing menu item details`,
  };
}

export default async function MenuItemAdminPage({
  params,
}: MenuItemAdminPageProps) {
  const { id } = await params;

  return <MenuItemDetaisCard id={id} />;
}
