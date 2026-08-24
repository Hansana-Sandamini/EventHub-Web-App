"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  ClipboardList,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import { eventsApi, usersApi, registrationsApi } from "@/lib/api";
import type { EventResponse, UserResponse, RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalUsers: number;
  totalRegistrations: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="stat-card" style={{ "--stat-color": color } as React.CSSProperties}>
      <div className="stat-icon-wrap">
        <Icon size={20} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-trend"><TrendingUp size={12} />{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    activeEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
  });
  const [recentEvents, setRecentEvents] = useState<EventResponse[]>([]);
  const [recentRegs, setRecentRegs] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, usRes, regRes] = await Promise.allSettled([
        eventsApi.getAll(),
        usersApi.getAll(),
        registrationsApi.getAll(),
      ]);

      const events: EventResponse[] =
        evRes.status === "fulfilled" ? evRes.value.data : [];
      const users: UserResponse[] =
        usRes.status === "fulfilled" ? usRes.value.data : [];
      const registrations: RegistrationResponse[] =
        regRes.status === "fulfilled" ? regRes.value.data : [];

      setStats({
        totalEvents: events.length,
        activeEvents: events.filter((e) => e.status === "ACTIVE").length,
        totalUsers: users.length,
        totalRegistrations: registrations.length,
      });
      setRecentEvents(events.slice(0, 5));
      setRecentRegs(registrations.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusBadge = (status: string) => {
    const cls =
      status === "ACTIVE"
        ? "badge-active"
        : status === "CANCELLED"
        ? "badge-cancelled"
        : "badge-completed";
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="animate-fadein">
        <div className="hero-banner">
          <div className="skeleton" style={{ height: 28, width: 260, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 18, width: 380 }} />
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 44, width: 44, borderRadius: "var(--radius-md)", marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 36, width: 80, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: 120 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadein">
      {/* Hero Banner */}
      <div className="hero-banner">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
          Welcome back 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Here&rsquo;s what&rsquo;s happening on your EventHub platform today.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <Link href="/events/new" className="btn btn-primary">
            <Plus size={16} /> Create Event
          </Link>
          <Link href="/users/new" className="btn btn-secondary">
            <Plus size={16} /> Add User
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={CalendarDays}
          label="Total Events"
          value={stats.totalEvents}
          color="var(--brand-500)"
          sub="All time"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Events"
          value={stats.activeEvents}
          color="var(--accent-emerald)"
          sub="Live now"
        />
        <StatCard
          icon={Users}
          label="Registered Users"
          value={stats.totalUsers}
          color="var(--accent-violet)"
          sub="Total members"
        />
        <StatCard
          icon={ClipboardList}
          label="Registrations"
          value={stats.totalRegistrations}
          color="var(--accent-amber)"
          sub="Tickets issued"
        />
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Events */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700 }}>
              Recent Events
            </h2>
            <Link href="/events" className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 24px" }}>
              <CalendarDays size={36} className="empty-icon" />
              <p className="text-secondary">No events yet</p>
            </div>
          ) : (
            <div>
              {recentEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", textDecoration: "none", transition: "background var(--transition-fast)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.status === "ACTIVE" ? "var(--accent-emerald)" : ev.status === "CANCELLED" ? "var(--accent-rose)" : "var(--accent-cyan)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{ev.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span className="truncate" style={{ fontSize: 12, color: "var(--text-muted)" }}>{ev.location}</span>
                    </div>
                  </div>
                  {statusBadge(ev.status)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700 }}>
              Recent Registrations
            </h2>
            <Link href="/registrations" className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentRegs.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 24px" }}>
              <ClipboardList size={36} className="empty-icon" />
              <p className="text-secondary">No registrations yet</p>
            </div>
          ) : (
            <div>
              {recentRegs.map((reg) => (
                <div
                  key={reg.id}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div className="avatar-fallback avatar-sm" style={{ fontSize: 12 }}>
                    {reg.userNic.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      NIC: {reg.userNic}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Clock size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {reg.registeredAt
                          ? format(new Date(reg.registeredAt), "MMM d, HH:mm")
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <span className="ticket-code">{reg.ticketCode?.slice(0, 8) ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
