"use client";

import Link from "next/link";
import { ModeToggle } from "../themeToggle";
import { Menu } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function AdminNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-customGreen fixed left-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {/* Hamburger only visible on small screens */}
              <button
                className="md:hidden text-foreground"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={26} />
              </button>
              <Link href="/" className="text-2xl font-bold text-foreground">
                GreyTop
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-foreground">ADMIN</p>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
