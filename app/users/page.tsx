"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Users, Mail, Phone, Trash2, Edit } from "lucide-react";
import { usersApi } from "@/lib/api";
import type { UserResponse } from "@/lib/api";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filtered, setFiltered] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.nic.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.mobile?.includes(q)
      )
    );
  }, [users, search]);

  const handleDelete = async (nic: string) => {
    if (!confirm(`Delete user ${nic}? This cannot be undone.`)) return;
    try {
      await usersApi.delete(nic);
      toast.success("User deleted");
      load();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="animate-fadein">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Users</h1>
          <p className="page-subheading">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link href="/users/new" className="btn btn-primary">
          <Plus size={16} /> Add User
        </Link>
      </div>

      {/* Filter */}
      <div className="filter-row">
        <div className="search-bar" style={{ maxWidth: 380 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name, NIC, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 16, width: "70%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: "50%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <Users size={56} className="empty-icon" />
          <h3 className="empty-title">No users found</h3>
          <p className="empty-desc">
            {search ? "Try a different search term" : "Add your first user to get started"}
          </p>
          {!search && (
            <Link href="/users/new" className="btn btn-primary">
              <Plus size={16} /> Add User
            </Link>
          )}
        </div>
      )}

      {/* User Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map((u) => (
            <div key={u.nic} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Avatar */}
                {u.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={usersApi.getPictureUrl(u.nic)}
                    alt={u.name}
                    className="avatar"
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="avatar-fallback" style={{ width: 56, height: 56, fontSize: 20 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                    {u.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{u.nic}</p>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {u.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Mail size={13} color="var(--brand-400)" />
                    <span className="truncate">{u.email}</span>
                  </div>
                )}
                {u.mobile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Phone size={13} color="var(--brand-400)" />
                    {u.mobile}
                  </div>
                )}
                {u.address && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    📍 {u.address}
                  </div>
                )}
              </div>

              <div className="divider" style={{ margin: "16px 0" }} />

              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/users/${u.nic}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                  View
                </Link>
                <Link href={`/users/${u.nic}/edit`} className="btn btn-secondary btn-sm btn-icon">
                  <Edit size={14} />
                </Link>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(u.nic)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
