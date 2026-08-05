"use client";

import { useState } from "react";
import styles from "../admin.module.css";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  return (
    <button
      className={compact ? styles.compactLogout : styles.logoutButton}
      disabled={pending}
      onClick={logout}
      type="button"
    >
      {pending ? "処理中…" : "ログアウト"}
    </button>
  );
}

