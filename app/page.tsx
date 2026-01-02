import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/data/current-user";
import { UserroleToggleButton } from "@/components/role-toggle-button";

export default async function Home() {
  const user = await getCurrentUser({ withFullUser: true });

  return (
    <div className="h-svh w-svw flex items-center  justify-center flex-col gap-2">
      {user ? (
        <div className="bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {user?.name}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    User ID
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-gray-800 font-mono break-all">
                      {user?.id}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Role
                    </label>
                    <div className="text-lg font-medium text-gray-800">
                      {user?.role}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="text-lg font-medium text-gray-800">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-3xl font-bold ">Dine Ease</p>
      )}
      {!user && (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      )}

      {user && <LogoutButton>Logout</LogoutButton>}
    </div>
  );
}