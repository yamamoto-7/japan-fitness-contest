import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { getAdminById } from "@/lib/auth/admin-user";
import { requireAdminSession } from "@/lib/auth/dal";
import { LogoutButton } from "./logout-button";
import { SessionActivityMonitor } from "./session-activity-monitor";
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
          <nav aria-label="管理メニュー">
            <Link className={styles.currentNav} href="/admin">ダッシュボード</Link>
            <span aria-disabled="true">大会管理</span>
            <span aria-disabled="true">団体管理</span>
          </nav>
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
