# Web-app

A modern, responsive frontend application for the **EventHub - Event & Ticketing Platform**. Built with Next.js App Router, React 19, and CSS custom properties, it is deployed on **GCP Cloud Run** and connects to backend microservices via the GCP Load Balancer API Gateway (`http://35.200.169.73:7000`).

---

## 👨‍🎓 Student & Project Metadata

| Requirement | Details |
|---|---|
| **Student Name** | Hansana Sandamini |
| **Student Number / ID** | `241722055` |
| **Slack Handle** | `@Hansana_Sandamini` |
| **GCP Project ID** | `eventhub-project-506715` |
| **Module** | ITS 2130 - Enterprise Cloud Architecture (ECA) |

---

## ⚙️ Tech Stack

| Technology | Details |
|---|---|
| Next.js | 16.3.1 (App Router) |
| React | 19.2.8 |
| TypeScript | 5 |
| CSS | Modern CSS with custom properties & dark theme |
| Axios | 1.19.0 HTTP client |
| Lucide React | Modern icon set |
| React Hot Toast | Notification system |
| date-fns | Date formatting utilities |
| Deployment | GCP Cloud Run (Production) |

---

## 📊 Features & Routes

| Page / Feature | Path | Description |
|---|---|---|
| **Dashboard** | `/` | Real-time statistics overview (Total Users, Active Events, Registrations, Capacity) |
| **Users Management** | `/users` | List users, view profile, create (`/users/new`), edit (`/users/[nic]/edit`), delete |
| **Events Management** | `/events` | List events, details (`/events/[id]`), create (`/events/new`), edit, seat tracking |
| **Registration & Tickets** | `/registrations` | View registrations with event filter, issue tickets (`/registrations/new`), cancel |

---

## 📁 Project Structure

```
web-app/
├── app/
│   ├── layout.tsx            # Root layout (AppShell wrapper)
│   ├── page.tsx              # Dashboard overview page
│   ├── users/
│   │   ├── page.tsx          # Users list page
│   │   ├── new/page.tsx      # Create user form page
│   │   └── [nic]/
│   │       ├── page.tsx      # User details page
│   │       └── edit/page.tsx # Edit user form page
│   ├── events/
│   │   ├── page.tsx          # Events list page
│   │   ├── new/page.tsx      # Create event form page
│   │   └── [id]/
│   │       ├── page.tsx      # Event details page
│   │       └── edit/page.tsx # Edit event form page
│   └── registrations/
│       ├── page.tsx          # Registrations list & filter page
│       └── new/page.tsx      # Issue new ticket form page
├── components/
│   └── layout/
│       ├── AppShell.tsx      # Application shell container
│       ├── Sidebar.tsx       # Navigation sidebar component
│       └── Topbar.tsx        # Topbar header component
├── lib/
│   └── api.ts                # Axios API client (usersApi, eventsApi, registrationsApi)
└── .env.local                # Local environment variables
```

---

## 🌐 Environment Variables

### Production (GCP Cloud Run)
Injected at build-time during GCP Cloud Build / Cloud Run deployment:
```env
NEXT_PUBLIC_API_BASE_URL=http://35.200.169.73:7000
```

### Development (Local)
Create `.env.local` in the `web-app/` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7000
```

---

## 🚀 Getting Started

> **Prerequisites:** Backend services (`Config-Server`, `Service-Registry`, `Api-Gateway`, `User-Service`, `Event-Service`, `Registration-Service`) must be running before starting the web application.

### Installation & Execution (Local)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```

The application will be accessible at: `http://localhost:3000`.
