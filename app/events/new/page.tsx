"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CalendarDays, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { eventsApi } from "@/lib/api";
import type { EventRequest } from "@/lib/api";

export default function NewEventPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<EventRequest>({
    title: "",
    description: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    capacity: 100,
    image: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof EventRequest, value: string | number | File | null) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({ ...e, image: "Only JPEG, PNG, or WebP images allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image must be under 5 MB" }));
      return;
    }
    set("image", file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.startDateTime) errs.startDateTime = "Start date is required";
    if (!form.endDateTime) errs.endDateTime = "End date is required";
    if (form.startDateTime && form.endDateTime && form.startDateTime >= form.endDateTime)
      errs.endDateTime = "End must be after start";
    if (!form.capacity || form.capacity < 1) errs.capacity = "Capacity must be at least 1";
    if (!form.image) errs.image = "Cover image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await eventsApi.create(form);
      toast.success("Event created successfully!");
      router.push("/events");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadein" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/events" className="btn btn-secondary btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-heading">Create Event</h1>
          <p className="page-subheading">Fill in the details for your new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ padding: 32 }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g. Tech Summit 2026"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description *</label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Describe your event…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              className="form-input"
              placeholder="City, Venue or Online"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          {/* Dates */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="startDateTime">Start Date & Time *</label>
              <input
                id="startDateTime"
                type="datetime-local"
                className="form-input"
                value={form.startDateTime}
                onChange={(e) => set("startDateTime", e.target.value)}
              />
              {errors.startDateTime && <span className="form-error">{errors.startDateTime}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDateTime">End Date & Time *</label>
              <input
                id="endDateTime"
                type="datetime-local"
                className="form-input"
                value={form.endDateTime}
                onChange={(e) => set("endDateTime", e.target.value)}
              />
              {errors.endDateTime && <span className="form-error">{errors.endDateTime}</span>}
            </div>
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label className="form-label" htmlFor="capacity">Capacity *</label>
            <input
              id="capacity"
              type="number"
              className="form-input"
              placeholder="100"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", parseInt(e.target.value) || 1)}
            />
            {errors.capacity && <span className="form-error">{errors.capacity}</span>}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Cover Image *</label>
            <div
              className="file-upload-area"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                handleFile(e.dataTransfer.files?.[0] ?? null);
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="file-preview" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); set("image", null); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="file-upload-icon"><Upload size={32} /></div>
                  <p className="file-upload-text">Click or drag & drop to upload</p>
                  <p className="file-upload-hint">JPEG, PNG, WebP · Max 5 MB</p>
                </>
              )}
            </div>
            {errors.image && <span className="form-error">{errors.image}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Link href="/events" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Creating…
              </>
            ) : (
              <><CalendarDays size={16} /> Create Event</>
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
