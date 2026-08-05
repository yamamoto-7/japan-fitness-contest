import { redirect } from "next/navigation";
import { Logo } from "@/app/components/logo";
import { getAdminSession } from "@/lib/auth/dal";
import { LoginForm } from "./login-form";
import styles from "../admin.module.css";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if (await getAdminSession()) {
    redirect("/admin");
  }

  const { reason } = await searchParams;

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.loginBrand}>
          <Logo />
          <p>大会情報管理システム</p>
        </div>
        <div className={styles.loginContent}>
          <LoginForm sessionReason={reason} />
        </div>
      </section>
    </main>
  );
}

