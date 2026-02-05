"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Tags,
  Settings,
  LogOut,
  ChevronLeft,
  PenSquare,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Bài viết",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "Thẻ",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    title: "Bình luận",
    href: "/admin/comments",
    icon: MessageSquare,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-[72px]" : "w-[260px]"}
        h-screen sticky top-0 
        bg-sidebar border-r border-sidebar-border
        flex flex-col
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <PenSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              Kairo's Blog
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            p-2 rounded-lg hover:bg-sidebar-accent transition-colors
            ${collapsed ? "mx-auto" : ""}
          `}
        >
          <ChevronLeft
            className={`w-5 h-5 text-sidebar-foreground transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? item.title : undefined}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-sidebar-primary-foreground" : ""}`}
              />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
            text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive
            transition-colors
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
