"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function ClientSidebar() {

  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/client" },
    { name: "Providers", href: "/client/providers" }
  ]

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
    <aside className="h-screen w-64 bg-white shadow-md border-r p-4 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-semibold text-center mb-6">Client Panel</div>
        <nav className="space-y-2 ">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100",
                pathname === item.href && "bg-gray-200 font-medium"
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