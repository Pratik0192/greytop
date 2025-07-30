"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Add new Client", href: "/admin/add-client" },
    { name: "All Clients", href: "/admin/clients" },
    { name: "Providers available", href: "/admin/providers" },
  ];

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/auth/logout");

      if (res.data.success) {
        toast.success("Logged out successfully");
        router.push("/");
        onClose();
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background text-foreground p-4 flex flex-col justify-between z-50 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-semibold">Greytop</div>
            <button onClick={onClose}>
              <X className="text-foreground" size={24} />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block px-4 py-2 rounded-md hover:bg-muted transition-colors",
                  pathname === item.href && "bg-muted font-medium"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <Button onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </aside>
    </>
  );
}
