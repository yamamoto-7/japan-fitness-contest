import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { getAdminById } from "@/lib/auth/admin-user";
import { requireAdminSession } from "@/lib/auth/dal";
import { LogoutButton } from "./logout-button";
import { SessionActivityMonitor } from "./session-activity-monitor";
import { AdminNav } from "./admin-nav";
import styles from "../admin.module.css";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  const admin = getAdminById(session.sub);

  if (!admin) {
    return null;
  }

  return (
    <SessionActivityMonitor>
      <div className={styles.adminShell}>
        <aside className={styles.adminSidebar}>
          <Link className={styles.adminLogo} href="/admin" aria-label="管理画面トップへ">
            <Logo />
          </Link>
          <AdminNav />
          <div className={styles.adminAccount}>
            <span>ログイン中</span>
            <strong>{admin.email}</strong>
            <LogoutButton />
          </div>
        </aside>
        <div className={styles.adminMain}>
          <header className={styles.adminTopbar}>
            <div>
              <span>JAPAN FITNESS CONTEST</span>
              <strong>管理システム</strong>
            </div>
            <LogoutButton compact />
          </header>
          {children}
        </div>
      </div>
    </SessionActivityMonitor>
  );
}
