"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../page.module.css";
import { Logo } from "./logo";

const navigationItems = [
  { href: "/#top", label: "ホーム" },
  { href: "/#featured", label: "大会一覧" },
  { href: "/events", label: "カレンダー" },
  { href: "/#news", label: "お知らせ" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/#top" aria-label="Japan Fitness Contest トップへ">
          <Logo />
        </Link>

        <nav className={styles.desktopNav} aria-label="メインナビゲーション">
          {navigationItems.map((item) => (
            <Link
              className={
                (pathname === "/" && item.href === "/#top") ||
                (pathname === "/events" && item.href === "/events")
                  ? styles.activeNav
                  : undefined
              }
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className={styles.searchButton} href="/events" aria-label="大会カレンダーを見る">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </Link>

        <details className={styles.mobileMenu}>
          <summary aria-label="メニューを開く">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="モバイルナビゲーション">
            {navigationItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
