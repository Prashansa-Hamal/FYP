"use client";

import { useEffect } from "react";

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older Safari
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function InitCartSession() {
  useEffect(() => {
    let sessionId = document.cookie
      .split("; ")
      .find((c) => c.startsWith("cart_session_id="))
      ?.split("=")[1];

    if (!sessionId) {
      sessionId = `guest_${generateUUID()}`;
      document.cookie = `cart_session_id=${sessionId}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  return null;
}
