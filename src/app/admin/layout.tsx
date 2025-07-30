import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminNavbar />
      <AdminSidebar />
      <main className="flex-1 p-6 bg-background min-h-screen">
        {children}
      </main>
    </div>
  )
}