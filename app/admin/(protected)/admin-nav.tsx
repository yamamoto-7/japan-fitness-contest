"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="管理メニュー">
      <Link className={pathname === "/admin" ? styles.currentNav : undefined} href="/admin">
        ダッシュボード
      </Link>
      <Link
        className={pathname.startsWith("/admin/events") ? styles.currentNav : undefined}
        href="/admin/events"
      >
        大会管理
      </Link>
      <span aria-disabled="true">団体管理</span>
    </nav>
  );
}
