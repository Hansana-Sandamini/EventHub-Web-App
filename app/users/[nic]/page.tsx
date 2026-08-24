"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Edit, Trash2, CalendarDays } from "lucide-react";
import { usersApi, registrationsApi } from "@/lib/api";
import type { UserResponse, RegistrationResponse } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UserDetailPage() {
  const { nic } = useParams<{ nic: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [regs, setRegs] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, regRes] = await Promise.allSettled([
        usersApi.getByNic(nic),
        registrationsApi.getByUser(nic),
      ]);
      if (userRes.status === "fulfilled") setUser(userRes.value.data);
      if (regRes.status === "fulfilled") setRegs(regRes.value.data);
    } catch {
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [nic]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm(`Delete user ${nic}? This cannot be undone.`)) return;
    try {
      await usersApi.delete(nic);
      toast.success("User deleted");
      router.push("/users");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="animate-fadein">
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div className="skeleton" style={{ width: 96, height: 96, borderRadius: "50%" }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 28, width: 240, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 16, width: 160 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <h3 className="empty-title">User not found</h3>
        <Link href="/users" className="btn btn-primary">Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="animate-fadein">
      <div style={{ marginBottom: 24 }}>
        <Link href="/users" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Users
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Main profile */}
        <div>
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={usersApi.getPictureUrl(user.nic)}
                  alt={user.name}
                  style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--brand-500)" }}
                />
              ) : (
                <div className="avatar-fallback" style={{ width: 96, height: 96, fontSize: 36 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                  {user.name}
                </h1>
                <p style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  NIC: {user.nic}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href={`/users/${nic}/edit`} className="btn btn-secondary btn-sm">
                    <Edit size={14} /> Edit
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {user.email && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Mail size={16} color="var(--brand-400)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{user.email}</div>
                  </div>
                </div>
              )}
              {user.mobile && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Phone size={16} color="var(--brand-400)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Mobile</div>
                    <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{user.mobile}</div>
                  </div>
                </div>
              )}
              {user.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, gridColumn: "1 / -1" }}>
                  <MapPin size={16} color="var(--brand-400)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Address</div>
                    <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{user.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registrations */}
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              <CalendarDays size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
              Event Registrations ({regs.length})
            </h2>
            {regs.length === 0 ? (
              <div className="empty-state" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-secondary">No registrations yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Event ID</th>
                      <th>Ticket Code</th>
                      <th>Registered At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regs.map((r) => (
                      <tr key={r.id}>
                        <td style={{ color: "var(--text-muted)" }}>{r.id}</td>
                        <td>
                          <Link href={`/events/${r.eventId}`} style={{ color: "var(--brand-400)", textDecoration: "none", fontWeight: 600 }}>
                            {r.eventId.slice(0, 12)}…
                          </Link>
                        </td>
                        <td><span className="ticket-code">{r.ticketCode ?? "—"}</span></td>
                        <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {r.registeredAt ? format(new Date(r.registeredAt), "MMM d, yyyy HH:mm") : "—"}
                        </td>
                        <td><span className={`badge ${r.status !== "CANCELLED" ? "badge-active" : "badge-cancelled"}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Side summary */}
        <div className="card" style={{ padding: 24, alignSelf: "start" }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Summary</h3>
          {[
            { label: "Total Registrations", value: regs.length },
            { label: "Active", value: regs.filter((r) => r.status !== "CANCELLED").length },
            { label: "Cancelled", value: regs.filter((r) => r.status === "CANCELLED").length },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <Link href={`/registrations/new?userNic=${nic}`} className="btn btn-primary w-full" style={{ justifyContent: "center" }}>
              Register for Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
