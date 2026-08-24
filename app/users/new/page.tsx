"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api";
import type { UserRequest } from "@/lib/api";

export default function NewUserPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<UserRequest>({
    nic: "",
    name: "",
    address: "",
    mobile: "",
    email: "",
    picture: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof UserRequest, value: string | File | null) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, picture: "Image must be under 5 MB" }));
      return;
    }
    set("picture", file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const nicReg = /^\d{9}[vV]$/;
    if (!form.nic.trim()) errs.nic = "NIC is required";
    else if (!nicReg.test(form.nic)) errs.nic = "NIC must be 9 digits followed by V or v";
    if (!form.name.trim()) errs.name = "Name is required";
    else if (!/^[a-zA-Z][a-zA-Z ]*$/.test(form.name)) errs.name = "Name can only contain letters and spaces";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.mobile.trim()) errs.mobile = "Mobile is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format";
    if (!form.picture) errs.picture = "Profile picture is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await usersApi.create(form);
      toast.success("User created successfully!");
      router.push("/users");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadein" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/users" className="btn btn-secondary btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-heading">Add User</h1>
          <p className="page-subheading">Register a new platform user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ padding: 32 }}>
          {/* NIC */}
          <div className="form-group">
            <label className="form-label" htmlFor="nic">NIC *</label>
            <input id="nic" type="text" className="form-input" placeholder="e.g. 123456789V" value={form.nic} onChange={(e) => set("nic", e.target.value)} />
            {errors.nic && <span className="form-error">{errors.nic}</span>}
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input id="name" type="text" className="form-input" placeholder="e.g. John Smith" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="address">Address *</label>
            <textarea id="address" className="form-textarea" rows={2} placeholder="Full address" value={form.address} onChange={(e) => set("address", e.target.value)} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          {/* Mobile + Email */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="mobile">Mobile *</label>
              <input id="mobile" type="tel" className="form-input" placeholder="+94 77 000 0000" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
              {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          {/* Picture */}
          <div className="form-group">
            <label className="form-label">Profile Picture *</label>
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
                  <img src={preview} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--brand-500)" }} />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>Picture selected</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Click to change</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); set("picture", null); if (fileRef.current) fileRef.current.value = ""; }} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="file-upload-icon"><Upload size={28} /></div>
                  <p className="file-upload-text">Upload profile picture</p>
                  <p className="file-upload-hint">JPEG, PNG, WebP · Max 5 MB</p>
                </>
              )}
            </div>
            {errors.picture && <span className="form-error">{errors.picture}</span>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Link href="/users" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : <><UserPlus size={16} /> Create User</>}
          </button>
        </div>
      </form>
    </div>
  );
}
