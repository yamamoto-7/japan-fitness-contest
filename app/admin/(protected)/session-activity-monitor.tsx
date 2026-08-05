"use client";

import { useCallback, useEffect, useRef } from "react";
import { SESSION_IDLE_TIMEOUT_MS } from "@/lib/auth/constants";

const REFRESH_INTERVAL_MS = 30_000;

export function SessionActivityMonitor({ children }: { children: React.ReactNode }) {
  const lastActivity = useRef(0);
  const lastRefresh = useRef(0);
  const logoutStarted = useRef(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoutForTimeout = useCallback(async () => {
    if (logoutStarted.current) {
      return;
    }

    logoutStarted.current = true;

    try {
      await fetch("/api/auth/logout", { method: "POST", keepalive: true });
    } finally {
      window.location.replace("/admin/login?reason=timeout");
    }
  }, []);

  const scheduleTimeout = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    const remaining = SESSION_IDLE_TIMEOUT_MS - (Date.now() - lastActivity.current);

    if (remaining <= 0) {
      void logoutForTimeout();
      return;
    }

    timeoutId.current = setTimeout(() => {
      void logoutForTimeout();
    }, remaining);
  }, [logoutForTimeout]);

  useEffect(() => {
    const initializedAt = Date.now();
    lastActivity.current = initializedAt;
    lastRefresh.current = initializedAt;

    const recordActivity = () => {
      const now = Date.now();

      if (now - lastActivity.current >= SESSION_IDLE_TIMEOUT_MS) {
        void logoutForTimeout();
        return;
      }

      lastActivity.current = now;
      scheduleTimeout();
    };
    const activityEvents: Array<keyof WindowEventMap> = [
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });
    window.addEventListener("focus", recordActivity);
    scheduleTimeout();

    const refreshTimer = window.setInterval(async () => {
      const now = Date.now();

      if (now - lastActivity.current >= SESSION_IDLE_TIMEOUT_MS) {
        await logoutForTimeout();
        return;
      }

      if (lastActivity.current <= lastRefresh.current) {
        return;
      }

      try {
        const response = await fetch("/api/auth/refresh", { method: "POST" });

        if (!response.ok) {
          window.location.replace("/admin/login?reason=expired");
          return;
        }

        lastRefresh.current = now;
      } catch {
        // 一時的な通信失敗では画面を遮断せず、Cookieの有効期限に委ねる。
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
      window.removeEventListener("focus", recordActivity);
      window.clearInterval(refreshTimer);

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [logoutForTimeout, scheduleTimeout]);

  return children;
}
