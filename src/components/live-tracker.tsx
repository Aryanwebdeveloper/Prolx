"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { pingLiveVisitor, trackPageView } from "@/app/actions";
import { v4 as uuidv4 } from "uuid";

export function LiveTracker() {
  const pathname = usePathname();
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    // Generate or retrieve visitor ID on first load
    let id = localStorage.getItem("prolx_visitor_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("prolx_visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  useEffect(() => {
    if (!visitorId || !pathname) return;

    // Capture referrer only on the very first page load, or when navigating from an external site
    // (Next.js client-side navigation doesn't update document.referrer)
    const currentReferrer = typeof document !== 'undefined' ? document.referrer : "";

    // Track historical page view
    trackPageView(visitorId, pathname, currentReferrer).catch((err) => {
      console.error("Page view tracking failed:", err);
    });

    // Ping immediately when path changes for the Live Dashboard
    const ping = () => {
      pingLiveVisitor(visitorId, pathname).catch((err) => {
        console.error("Live tracker ping failed:", err);
      });
    };

    ping();

    // Set up an interval to ping every 60 seconds to keep the session "alive"
    const interval = setInterval(ping, 60000);

    return () => clearInterval(interval);
  }, [pathname, visitorId]);

  return null; // This component doesn't render anything
}
