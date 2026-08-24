"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { eventsApi } from "@/lib/api";
import type { EventRequest, EventResponse } from "@/lib/api";
import { format } from "date-fns";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
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

  const load = useCallback(async () => {
    try {
      const res = await eventsApi.getById(id);
      const ev: EventResponse = res.data;
      // Format datetime-local value (strip seconds)
      const fmtDt = (dt: string) => dt ? format(new Date(dt), "yyyy-MM-dd'T'HH:mm") : "";
      setForm({
        title: ev.title,
        description: ev.description,
        location: ev.location,
        startDateTime: fmtDt(ev.startDateTime),
        endDateTime: fmtDt(ev.endDateTime),
        capacity: ev.capacity,
        image: null,
      });
      if (ev.image) setExistingImage(eventsApi.getImageUrl(id));
    } catch {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof EventRequest, value: string | number | File | null) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await eventsApi.update(id, form);
      toast.success("Event updated successfully!");
      router.push(`/events/${id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fadein" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div className="card" style={{ padding: 32 }}>
          {[...Array(6)].map((_, i) => (
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
    <div className="animate-fadein" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href={`/events/${id}`} className="btn btn-secondary btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-heading">Edit Event</h1>
          <p className="page-subheading">Update the event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title *</label>
            <input id="title" type="text" className="form-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description *</label>
            <textarea id="description" className="form-textarea" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location *</label>
            <input id="location" type="text" className="form-input" value={form.location} onChange={(e) => set("location", e.target.value)} />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="startDateTime">Start Date & Time *</label>
              <input id="startDateTime" type="datetime-local" className="form-input" value={form.startDateTime} onChange={(e) => set("startDateTime", e.target.value)} />
              {errors.startDateTime && <span className="form-error">{errors.startDateTime}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDateTime">End Date & Time *</label>
              <input id="endDateTime" type="datetime-local" className="form-input" value={form.endDateTime} onChange={(e) => set("endDateTime", e.target.value)} />
              {errors.endDateTime && <span className="form-error">{errors.endDateTime}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="capacity">Capacity *</label>
            <input id="capacity" type="number" className="form-input" min={1} value={form.capacity} onChange={(e) => set("capacity", parseInt(e.target.value) || 1)} />
            {errors.capacity && <span className="form-error">{errors.capacity}</span>}
          </div>

          {/* Image */}
          <div className="form-group">
            <label className="form-label">Cover Image (optional — leave empty to keep existing)</label>
            {existingImage && !preview && (
              <div style={{ marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existingImage} alt="Current" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Current image — upload a new one to replace</p>
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
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="file-preview" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); set("image", null); if (fileRef.current) fileRef.current.value = ""; }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="file-upload-icon"><Upload size={28} /></div>
                  <p className="file-upload-text">Click or drag to upload new image</p>
                  <p className="file-upload-hint">JPEG, PNG, WebP · Max 5 MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Link href={`/events/${id}`} className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : <><CalendarDays size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
