"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  Zap,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/users", label: "Users", icon: Users },
  { href: "/registrations", label: "Registrations", icon: ClipboardList },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo */}
      <Link href="/" className="sidebar-logo" onClick={onClose}>
        <div className="logo-icon">
          <Zap size={22} color="white" strokeWidth={2.5} />
        </div>
        <span className="logo-text">EventHub</span>

        {/* Close button on mobile */}
        <button
          onClick={(e) => { e.preventDefault(); onClose(); }}
          className="topbar-btn"
          style={{ marginLeft: "auto", display: "flex" }}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Main Menu</span>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          EventHub Platform v1.0
        </div>
      </div>
    </aside>
  );
}
