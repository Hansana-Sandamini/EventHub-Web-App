"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api";
import type { UserRequest } from "@/lib/api";

export default function EditUserPage() {
  const { nic } = useParams<{ nic: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingPicture, setExistingPicture] = useState<string | null>(null);
  const [form, setForm] = useState<UserRequest>({
    nic: "",
    name: "",
    address: "",
    mobile: "",
    email: "",
    picture: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await usersApi.getByNic(nic);
      const u = res.data;
      setForm({ nic: u.nic, name: u.name, address: u.address, mobile: u.mobile, email: u.email ?? "", picture: null });
      if (u.picture) setExistingPicture(usersApi.getPictureUrl(nic));
    } catch {
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [nic]);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof UserRequest, value: string | File | null) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors((e) => ({ ...e, picture: "Image must be under 5 MB" })); return; }
    set("picture", file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (!/^[a-zA-Z][a-zA-Z ]*$/.test(form.name)) errs.name = "Name can only contain letters and spaces";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.mobile.trim()) errs.mobile = "Mobile is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await usersApi.update(nic, form);
      toast.success("User updated!");
      router.push(`/users/${nic}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fadein" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="skeleton" style={{ height: 40, width: 180, marginBottom: 32 }} />
        <div className="card" style={{ padding: 32 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="form-group">
              <div className="skeleton" style={{ height: 14, width: 100, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 44 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadein" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href={`/users/${nic}`} className="btn btn-secondary btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-heading">Edit User</h1>
          <p className="page-subheading">NIC: {nic}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea className="form-textarea" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <input type="tel" className="form-input" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
              {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Picture (optional — leave empty to keep existing)</label>
            {existingPicture && !preview && (
              <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existingPicture} alt="Current" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--brand-500)" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Current picture</span>
              </div>
            )}
            <div
              className="file-upload-area"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag-over"); handleFile(e.dataTransfer.files?.[0] ?? null); }}
            >
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              {preview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>New picture selected</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); set("picture", null); if (fileRef.current) fileRef.current.value = ""; }} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="file-upload-icon"><Upload size={24} /></div>
                  <p className="file-upload-text">Upload new profile picture</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Link href={`/users/${nic}`} className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
