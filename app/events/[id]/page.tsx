"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Clock, Users, Edit, Trash2,
  CalendarDays, ClipboardList, Plus,
} from "lucide-react";
import { eventsApi, registrationsApi, getEventSeatStats } from "@/lib/api";
import type { EventResponse, RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [regs, setRegs] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, regRes] = await Promise.allSettled([
        eventsApi.getById(id),
        registrationsApi.getByEvent(id),
      ]);
      if (evRes.status === "fulfilled") setEvent(evRes.value.data);
      if (regRes.status === "fulfilled") setRegs(regRes.value.data);
    } catch {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm("Delete this event permanently?")) return;
    try {
      await eventsApi.delete(id);
      toast.success("Event deleted");
      router.push("/events");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleCancelReg = async (regId: number) => {
    if (!confirm("Cancel this registration?")) return;
    try {
      await registrationsApi.cancel(regId);
      toast.success("Registration cancelled");
      load();
    } catch {
      toast.error("Failed to cancel registration");
    }
  };

  if (loading) {
    return (
      <div className="animate-fadein">
        <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)", marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 28, width: 300, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: 500 }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="empty-state">
        <CalendarDays size={56} className="empty-icon" />
        <h3 className="empty-title">Event not found</h3>
        <Link href="/events" className="btn btn-primary">Back to Events</Link>
      </div>
    );
  }

  const statusCls =
    event.status === "ACTIVE" ? "badge-active" : event.status === "CANCELLED" ? "badge-cancelled" : "badge-completed";
  const { seatsUsed, remainingSeats, seatsPercent } = getEventSeatStats(event.capacity, regs);

  return (
    <div className="animate-fadein">
      {/* Back */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/events" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Main */}
        <div>
          {/* Event Image */}
          {event.image ? (
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 24 }}>
              <Image
                src={eventsApi.getImageUrl(event.id)}
                alt={event.title}
                width={800}
                height={360}
                style={{ width: "100%", height: 320, objectFit: "cover" }}
                unoptimized
              />
            </div>
          ) : (
            <div style={{ height: 240, background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-card-hover))", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <CalendarDays size={64} color="var(--text-muted)" />
            </div>
          )}

          {/* Title + status */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                {event.title}
              </h1>
              <span className={`badge ${statusCls}`}>{event.status}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/events/${id}/edit`} className="btn btn-secondary">
                <Edit size={15} /> Edit
              </Link>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", fontSize: 14 }}>
              <MapPin size={16} color="var(--brand-400)" /> {event.location}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", fontSize: 14 }}>
              <Clock size={16} color="var(--brand-400)" />
              {event.startDateTime ? format(new Date(event.startDateTime), "EEEE, MMMM d, yyyy · HH:mm") : "—"}
              {" → "}
              {event.endDateTime ? format(new Date(event.endDateTime), "HH:mm") : "—"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", fontSize: 14 }}>
              <Users size={16} color="var(--brand-400)" />
              {remainingSeats} / {event.capacity} seats remaining
            </div>
          </div>

          {/* Seats progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              <span>{seatsUsed} registered</span>
              <span>{seatsPercent}% capacity</span>
            </div>
            <div className="seats-bar" style={{ height: 8 }}>
              <div className="seats-bar-fill" style={{ width: `${seatsPercent}%` }} />
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              About this Event
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>
              {event.description}
            </p>
          </div>
        </div>

        {/* Sidebar panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick stats */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Quick Stats
            </h3>
            {[
              { label: "Total Capacity", value: event.capacity },
              { label: "Seats Taken", value: seatsUsed },
              { label: "Remaining Seats", value: remainingSeats },
              { label: "Registrations", value: regs.length },
              { label: "Created", value: event.createdAt ? format(new Date(event.createdAt), "MMM d, yyyy") : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Quick register */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              Register Attendee
            </h3>
            <Link
              href={`/registrations/new?eventId=${id}`}
              className="btn btn-primary w-full"
              style={{ justifyContent: "center" }}
            >
              <Plus size={16} /> New Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Registrations table */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700 }}>
            <ClipboardList size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
            Registrations ({regs.length})
          </h2>
        </div>

        {regs.length === 0 ? (
          <div className="empty-state" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <ClipboardList size={40} className="empty-icon" />
            <p className="text-secondary">No registrations for this event yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User NIC</th>
                  <th>Ticket Code</th>
                  <th>Registered At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--text-muted)" }}>{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.userNic}</td>
                    <td><span className="ticket-code">{r.ticketCode ?? "—"}</span></td>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {r.registeredAt ? format(new Date(r.registeredAt), "MMM d, yyyy HH:mm") : "—"}
                    </td>
                    <td><span className={`badge ${r.status !== "CANCELLED" ? "badge-active" : "badge-cancelled"}`}>{r.status}</span></td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelReg(r.id)}
                        disabled={r.status === "CANCELLED"}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
