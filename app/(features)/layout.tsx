import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#FFFDF9]">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Topbar userEmail={String(user?.email)} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
