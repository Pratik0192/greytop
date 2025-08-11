"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function AdminSidebar() {

  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Add new Client", href: "/admin/add-client" },
    { name: "All Clients", href: "/admin/clients" },
    { name: "Providers", href: "/admin/providers" },
    { name: "Games", href: "/admin/games" },
  ];

  const handleLogout = async() => {
    try {
      const res = await api.post("/api/auth/logout");

      if(res.data.success) {
        toast.success("Logged out successfully")
        router.push("/");
      } else {
        toast.error("Logout failed");
      }

    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return ( 
    <aside className="hidden md:flex h-screen w-64 bg-customGreen text-foreground p-4 flex-col justify-between">
      <div>
        <div className="text-2xl font-semibold text-center mb-6">Greytop</div>
        <nav className="space-y-2 ">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex justify-center items-center px-4 py-2 rounded-md",
                pathname === item.href && "bg-background font-medium"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <Button onClick={handleLogout} className="w-56">Logout</Button>
    </aside>
  )
}