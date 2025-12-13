import { UserroleToggleButton } from "@/components/role-toggle-button";
import { COOKIE_SESSION_KEY, getUserFromSession } from "@/cores/session";
import { getCurrentUser } from "@/data/current-user";

const PrivetePage = async () => {
  const user = await getCurrentUser({ withFullUser: true });

  return (
    <div>
      <h1>PrivetePage</h1>
      <p>
        UserID: <span>{user?.id || "No User Found"}</span>
      </p>

      <p>
        User role: <span>{user?.role || "Invalid"}</span>
      </p>
      <p>
        User role: <span>{user?.name || "Invalid"}</span>
      </p>

      <UserroleToggleButton />
    </div>
  );
};

export default PrivetePage;
