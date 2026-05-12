import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/styles/admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const access = canAccessAdmin(user);

  if (!access.allowed) {
    redirect(access.redirectTo || "/auth/giris");
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
