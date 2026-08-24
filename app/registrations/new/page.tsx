"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import toast from "react-hot-toast";
import { registrationsApi, eventsApi, usersApi, getEventSeatStats } from "@/lib/api";
import type { EventResponse, UserResponse, RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";
import { Suspense } from "react";

function NewRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preEventId = searchParams.get("eventId") ?? "";
  const preUserNic = searchParams.get("userNic") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [regs, setRegs] = useState<RegistrationResponse[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ userNic: preUserNic, eventId: preEventId });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [evRes, usRes, regRes] = await Promise.allSettled([
      eventsApi.getAll(),
      usersApi.getAll(),
      registrationsApi.getAll(),
    ]);
    if (evRes.status === "fulfilled") {
      const active = evRes.value.data.filter((e) => e.status === "ACTIVE");
      setEvents(active);
      if (preEventId) {
        const ev = active.find((e) => e.id === preEventId);
        if (ev) setSelectedEvent(ev);
      }
    }
    if (usRes.status === "fulfilled") {
      setUsers(usRes.value.data);
      if (preUserNic) {
        const u = usRes.value.data.find((u) => u.nic === preUserNic);
        if (u) setSelectedUser(u);
      }
    }
    if (regRes.status === "fulfilled") {
      setRegs(regRes.value.data);
    }
  }, [preEventId, preUserNic]);

  useEffect(() => { load(); }, [load]);

  const filteredEvents = events.filter((e) =>
    !eventSearch || e.title.toLowerCase().includes(eventSearch.toLowerCase()) || e.location.toLowerCase().includes(eventSearch.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.nic.toLowerCase().includes(userSearch.toLowerCase())
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.userNic) errs.userNic = "Please select a user";
    if (!form.eventId) errs.eventId = "Please select an event";
    if (selectedEvent) {
      const { remainingSeats } = getEventSeatStats(selectedEvent.capacity, regs, selectedEvent.id);
      if (remainingSeats <= 0) {
        errs.eventId = "This event has no remaining seats available";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await registrationsApi.create(form);
      toast.success("Registration created! Ticket issued.");
      router.push("/registrations");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to create registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadein" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/registrations" className="btn btn-secondary btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-heading">New Registration</h1>
          <p className="page-subheading">Register a user for an active event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Select Event */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              1. Select Event
            </h2>

            <div className="search-bar" style={{ marginBottom: 16 }}>
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Search events…" value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} />
            </div>

            {selectedEvent && (
              <div style={{ background: "color-mix(in srgb, var(--brand-500) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--brand-500) 30%, transparent)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{selectedEvent.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {selectedEvent.location} · {getEventSeatStats(selectedEvent.capacity, regs, selectedEvent.id).remainingSeats} seats left
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedEvent(null); setForm((f) => ({ ...f, eventId: "" })); }} className="btn btn-secondary btn-sm">Change</button>
                </div>
              </div>
            )}

            {!selectedEvent && (
              <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredEvents.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No active events</p>
                )}
                {filteredEvents.map((ev) => {
                  const { remainingSeats } = getEventSeatStats(ev.capacity, regs, ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => { setSelectedEvent(ev); setForm((f) => ({ ...f, eventId: ev.id })); setErrors((e) => ({ ...e, eventId: "" })); }}
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "14px 16px", textAlign: "left", cursor: "pointer", transition: "all var(--transition-fast)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand-500)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    >
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12 }}>
                        <span>📍 {ev.location}</span>
                        <span>🕐 {ev.startDateTime ? format(new Date(ev.startDateTime), "MMM d, yyyy") : "—"}</span>
                        <span>🎟 {remainingSeats} / {ev.capacity} seats left</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.eventId && <span className="form-error" style={{ marginTop: 8, display: "block" }}>{errors.eventId}</span>}
          </div>

          {/* Select User */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              2. Select User
            </h2>

            <div className="search-bar" style={{ marginBottom: 16 }}>
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Search by name or NIC…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            </div>

            {selectedUser && (
              <div style={{ background: "color-mix(in srgb, var(--accent-violet) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-violet) 30%, transparent)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="avatar-fallback avatar-sm">{selectedUser.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedUser.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{selectedUser.nic}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedUser(null); setForm((f) => ({ ...f, userNic: "" })); }} className="btn btn-secondary btn-sm">Change</button>
                </div>
              </div>
            )}

            {!selectedUser && (
              <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredUsers.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No users found</p>
                )}
                {filteredUsers.map((u) => (
                  <button
                    key={u.nic}
                    type="button"
                    onClick={() => { setSelectedUser(u); setForm((f) => ({ ...f, userNic: u.nic })); setErrors((e) => ({ ...e, userNic: "" })); }}
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "12px 16px", textAlign: "left", cursor: "pointer", transition: "all var(--transition-fast)", display: "flex", gap: 12, alignItems: "center" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand-500)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                  >
                    <div className="avatar-fallback avatar-sm">{u.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{u.nic}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errors.userNic && <span className="form-error" style={{ marginTop: 8, display: "block" }}>{errors.userNic}</span>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Link href="/registrations" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting || !form.eventId || !form.userNic}>
            {submitting ? "Registering…" : <><ClipboardList size={16} /> Create Registration</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="animate-fadein" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 300, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    }>
      <NewRegistrationForm />
    </Suspense>
  );
}
