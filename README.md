# Web-app

A modern, responsive frontend application for the **EventHub - Event & Ticketing Platform**. Built with Next.js App Router, React, and CSS custom properties, it provides a full UI for managing users, events, and ticket registrations through the API Gateway.

## Tech Stack

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

## Features

| Page / Feature | Path | Description |
|---|---|---|
| Dashboard | `/` | Stats overview (Total Users, Active Events, Registrations, Capacity), recent activity |
| Users Management | `/users` | List, view profile, create user (`/users/new`), edit (`/users/[nic]/edit`), delete users |
| Events Management | `/events` | List events, view details (`/events/[id]`), create event (`/events/new`), edit, seat stats |
| Registration & Tickets | `/registrations` | View registrations with event filter, issue tickets (`/registrations/new`), cancel registrations |

## Project Structure

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

## Environment Variables

Create a `.env.local` file in the `web-app/` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7000
```

## Getting Started

> **Prerequisites:** All backend services (Config-Server, Service-Registry, Api-Gateway, User-Service, Event-Service, Registration-Service) must be running before starting the web application.

**Full startup order:**
1. Config-Server (`9000`)
2. Service-Registry (`9001`)
3. Api-Gateway (`7000`)
4. User-Service (`8000`)
5. Event-Service (`8001`)
6. Registration-Service (`8002`)
7. **Web-app** (`3000`)

### Installation & Execution

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000`

