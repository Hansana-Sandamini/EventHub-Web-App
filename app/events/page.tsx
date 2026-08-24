"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Filter,
} from "lucide-react";
import { eventsApi, registrationsApi, getEventSeatStats } from "@/lib/api";
import type { EventResponse, RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

function statusBadge(status: string) {
  const cls =
    status === "ACTIVE" ? "badge-active" : status === "CANCELLED" ? "badge-cancelled" : "badge-completed";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [regs, setRegs] = useState<RegistrationResponse[]>([]);
  const [filtered, setFiltered] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, regRes] = await Promise.allSettled([
        eventsApi.getAll(),
        registrationsApi.getAll(),
      ]);
      if (evRes.status === "fulfilled") {
        setEvents(evRes.value.data);
        setFiltered(evRes.value.data);
      }
      if (regRes.status === "fulfilled") {
        setRegs(regRes.value.data);
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = [...events];
    if (statusFilter !== "ALL") list = list.filter((e) => e.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [events, search, statusFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await eventsApi.delete(id);
      toast.success("Event deleted");
      load();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="animate-fadein">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Events</h1>
          <p className="page-subheading">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar" style={{ maxWidth: 360 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm btn-secondary ${statusFilter === s ? "active" : ""}`}
              style={statusFilter === s ? { borderColor: "var(--brand-500)", color: "var(--brand-400)" } : {}}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => setViewMode("grid")}
            className={`btn btn-icon btn-secondary`}
            title="Grid view"
            style={viewMode === "grid" ? { borderColor: "var(--brand-500)", color: "var(--brand-400)" } : {}}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`btn btn-icon btn-secondary`}
            title="Table view"
            style={viewMode === "table" ? { borderColor: "var(--brand-500)", color: "var(--brand-400)" } : {}}
          >
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="events-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="event-card">
              <div className="skeleton" style={{ height: 180 }} />
              <div style={{ padding: 20 }}>
                <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <CalendarDays size={56} className="empty-icon" />
          <h3 className="empty-title">No events found</h3>
          <p className="empty-desc">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first event to get started"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link href="/events/new" className="btn btn-primary">
              <Plus size={16} /> Create Event
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="events-grid">
          {filtered.map((ev) => {
            const { remainingSeats, seatsPercent } = getEventSeatStats(ev.capacity, regs, ev.id);
            return (
              <Link href={`/events/${ev.id}`} key={ev.id} className="event-card" style={{ textDecoration: "none" }}>
                {ev.image ? (
                  <Image
                    src={eventsApi.getImageUrl(ev.id)}
                    alt={ev.title}
                    width={400}
                    height={180}
                    className="event-card-image"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : (
                  <div className="event-card-image-placeholder">
                    <CalendarDays size={40} />
                  </div>
                )}
                <div className="event-card-body">
                  <h3 className="event-card-title">{ev.title}</h3>
                  <p className="event-card-desc">{ev.description}</p>
                  <div className="event-card-meta">
                    <div className="event-card-meta-item">
                      <MapPin size={13} /> {ev.location}
                    </div>
                    <div className="event-card-meta-item">
                      <Clock size={13} />
                      {ev.startDateTime
                        ? format(new Date(ev.startDateTime), "MMM d, yyyy · HH:mm")
                        : "—"}
                    </div>
                    <div className="event-card-meta-item">
                      <Users size={13} />
                      {remainingSeats} / {ev.capacity} seats left
                    </div>
                  </div>
                  {/* Seats bar */}
                  <div className="seats-bar">
                    <div className="seats-bar-fill" style={{ width: `${seatsPercent}%` }} />
                  </div>
                  <div className="event-card-footer" style={{ marginTop: 14 }}>
                    {statusBadge(ev.status)}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDelete(ev.id, e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {!loading && filtered.length > 0 && viewMode === "table" && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>Capacity</th>
                <th>Seats Left</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const { remainingSeats } = getEventSeatStats(ev.capacity, regs, ev.id);
                return (
                  <tr key={ev.id}>
                    <td>
                      <Link href={`/events/${ev.id}`} style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "none" }}>
                        {ev.title}
                      </Link>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{ev.location}</td>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {ev.startDateTime ? format(new Date(ev.startDateTime), "MMM d, yyyy") : "—"}
                    </td>
                    <td>{ev.capacity}</td>
                    <td>{remainingSeats}</td>
                    <td>{statusBadge(ev.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/events/${ev.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(ev.id, e)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
