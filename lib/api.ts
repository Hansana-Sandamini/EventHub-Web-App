import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ---------- Event Service ----------
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  remainingSeats: number;
  image: string;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  createdAt: string;
}

export interface EventRequest {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  image?: File | null;
}

export const eventsApi = {
  getAll: () => api.get<EventResponse[]>("/api/v1/events"),
  getById: (id: string) => api.get<EventResponse>(`/api/v1/events/${id}`),
  create: (data: EventRequest) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("description", data.description);
    form.append("location", data.location);
    form.append("startDateTime", data.startDateTime);
    form.append("endDateTime", data.endDateTime);
    form.append("capacity", String(data.capacity));
    if (data.image) form.append("image", data.image);
    return api.post<EventResponse>("/api/v1/events", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id: string, data: EventRequest) => {
    const form = new FormData();
    form.append("title", data.title);
    form.append("description", data.description);
    form.append("location", data.location);
    form.append("startDateTime", data.startDateTime);
    form.append("endDateTime", data.endDateTime);
    form.append("capacity", String(data.capacity));
    if (data.image) form.append("image", data.image);
    return api.put<EventResponse>(`/api/v1/events/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string) => api.delete(`/api/v1/events/${id}`),
  getImageUrl: (id: string) => `${BASE_URL}/api/v1/events/${id}/image`,
};

// ---------- User Service ----------
export interface UserResponse {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  picture: string;
}

export interface UserRequest {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  picture?: File | null;
}

export const usersApi = {
  getAll: () => api.get<UserResponse[]>("/api/v1/users"),
  getByNic: (nic: string) => api.get<UserResponse>(`/api/v1/users/${nic}`),
  create: (data: UserRequest) => {
    const form = new FormData();
    form.append("nic", data.nic);
    form.append("name", data.name);
    form.append("address", data.address);
    form.append("mobile", data.mobile);
    if (data.email) form.append("email", data.email);
    if (data.picture) form.append("picture", data.picture);
    return api.post<UserResponse>("/api/v1/users", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (nic: string, data: UserRequest) => {
    const form = new FormData();
    form.append("name", data.name);
    form.append("address", data.address);
    form.append("mobile", data.mobile);
    if (data.email) form.append("email", data.email);
    if (data.picture) form.append("picture", data.picture);
    return api.put<UserResponse>(`/api/v1/users/${nic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (nic: string) => api.delete(`/api/v1/users/${nic}`),
  getPictureUrl: (nic: string) => `${BASE_URL}/api/v1/users/${nic}/picture`,
};

// ---------- Registration Service ----------
export interface RegistrationResponse {
  id: number;
  userNic: string;
  eventId: string;
  ticketCode: string;
  registeredAt: string;
  status: string;
  user?: UserResponse;
}

export interface RegistrationRequest {
  userNic: string;
  eventId: string;
}

export const registrationsApi = {
  getAll: () => api.get<RegistrationResponse[]>("/api/v1/registrations"),
  getById: (id: number) => api.get<RegistrationResponse>(`/api/v1/registrations/${id}`),
  getByUser: (nic: string) => api.get<RegistrationResponse[]>(`/api/v1/registrations/user/${nic}`),
  getByEvent: (eventId: string) => api.get<RegistrationResponse[]>(`/api/v1/registrations?eventId=${eventId}`),
  create: (data: RegistrationRequest) => api.post<RegistrationResponse>("/api/v1/registrations", data),
  cancel: (id: number) => api.delete(`/api/v1/registrations/${id}`),
};

export function getEventSeatStats(
  capacity: number,
  registrations: RegistrationResponse[],
  eventId?: string
) {
  const activeRegs = registrations.filter(
    (r) => (eventId ? r.eventId === eventId : true) && r.status !== "CANCELLED"
  );
  const seatsUsed = activeRegs.length;
  const remainingSeats = Math.max(0, capacity - seatsUsed);
  const seatsPercent = capacity > 0 ? Math.min(100, Math.round((seatsUsed / capacity) * 100)) : 0;
  return { seatsUsed, remainingSeats, seatsPercent };
}
