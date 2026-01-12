import MenuItemAdminClient from "./_components/menuItemDetailsCard";

interface MenuItemAdminPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuItemAdminPage({
  params,
}: MenuItemAdminPageProps) {
  const { id } = await params;

  return <MenuItemAdminClient id={id} />;
}
