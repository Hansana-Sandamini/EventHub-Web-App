import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "EventHub — Event & Ticketing Platform",
  description:
    "Manage events, users, and registrations on the EventHub platform — a modern microservices-powered event ticketing system.",
  keywords: ["events", "ticketing", "management", "eventhub"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161928",
              color: "#f1f5f9",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#161928" },
            },
            error: {
              iconTheme: { primary: "#f43f5e", secondary: "#161928" },
            },
          }}
        />
      </body>
    </html>
  );
}
