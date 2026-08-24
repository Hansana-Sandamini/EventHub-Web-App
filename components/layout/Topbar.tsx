"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, RefreshCw } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Overview of your platform" },
  "/events": { title: "Events", subtitle: "Manage all events" },
  "/users": { title: "Users", subtitle: "Manage registered users" },
  "/registrations": { title: "Registrations", subtitle: "View all ticket registrations" },
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();

  const matchedKey =
    Object.keys(pageTitles)
      .filter((k) => k !== "/")
      .find((k) => pathname.startsWith(k)) ?? "/";

  const page = pageTitles[matchedKey] ?? pageTitles["/"];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-btn hamburger"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          style={{ display: "flex" }}
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="topbar-title">{page.title}</div>
          <div className="topbar-subtitle">{page.subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn" aria-label="Notifications">
          <Bell size={17} />
        </button>
        <button
          className="topbar-btn"
          aria-label="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  );
}
