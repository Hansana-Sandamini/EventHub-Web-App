"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, ClipboardList, Trash2 } from "lucide-react";
import { registrationsApi } from "@/lib/api";
import type { RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [filtered, setFiltered] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await registrationsApi.getAll();
      setRegistrations(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search) { setFiltered(registrations); return; }
    const q = search.toLowerCase();
    setFiltered(
      registrations.filter(
        (r) =>
          r.userNic.toLowerCase().includes(q) ||
          r.eventId?.toLowerCase().includes(q) ||
          r.ticketCode?.toLowerCase().includes(q)
      )
    );
  }, [registrations, search]);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this registration?")) return;
    try {
      await registrationsApi.cancel(id);
      toast.success("Registration cancelled");
      load();
    } catch {
      toast.error("Failed to cancel registration");
    }
  };

  return (
    <div className="animate-fadein">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Registrations</h1>
          <p className="page-subheading">
            {filtered.length} registration{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/registrations/new" className="btn btn-primary">
          <Plus size={16} /> New Registration
        </Link>
      </div>

      {/* Search */}
      <div className="filter-row">
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by NIC, event ID, ticket code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>User NIC</th><th>Event ID</th><th>Ticket Code</th><th>Registered At</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <ClipboardList size={56} className="empty-icon" />
          <h3 className="empty-title">No registrations found</h3>
          <p className="empty-desc">
            {search ? "Try a different search term" : "Register a user for an event to get started"}
          </p>
          {!search && (
            <Link href="/registrations/new" className="btn btn-primary">
              <Plus size={16} /> New Registration
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User NIC</th>
                <th>Event</th>
                <th>Ticket Code</th>
                <th>Registered At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text-muted)", width: 60 }}>{r.id}</td>
                  <td>
                    <Link href={`/users/${r.userNic}`} style={{ color: "var(--brand-400)", fontWeight: 600, textDecoration: "none", fontFamily: "monospace", fontSize: 13 }}>
                      {r.userNic}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/events/${r.eventId}`} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 12, fontFamily: "monospace" }}>
                      {r.eventId?.slice(0, 14)}…
                    </Link>
                  </td>
                  <td>
                    <span className="ticket-code">{r.ticketCode ?? "—"}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: 13 }}>
                    {r.registeredAt ? format(new Date(r.registeredAt), "MMM d, yyyy HH:mm") : "—"}
                  </td>
                  <td>
                    <span className={`badge ${r.status !== "CANCELLED" ? "badge-active" : "badge-cancelled"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(r.id)}
                      disabled={r.status === "CANCELLED"}
                    >
                      <Trash2 size={13} /> Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
