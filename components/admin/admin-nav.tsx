"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "D" },
  { href: "/admin/leads", label: "Leads", icon: "L" },
  { href: "/admin/projects", label: "Proyectos", icon: "P" },
  { href: "/admin/properties", label: "Inmuebles", icon: "I" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav-stack">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link key={item.href} href={item.href} className={`admin-nav-item ${isActive ? "is-active" : ""}`}>
            <div className="admin-nav-item__icon">{item.icon}</div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
