import db from "@/lib/db";
import UsersDataTable from "./_components/users-data-table";

const UsersPage = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <UsersDataTable data={users} />;
};

export default UsersPage;
