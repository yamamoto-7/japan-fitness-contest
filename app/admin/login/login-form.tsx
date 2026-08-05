"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export function LoginForm({ sessionReason }: { sessionReason?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const sessionMessage =
    sessionReason === "timeout" || sessionReason === "expired"
      ? "10分間操作がなかったため、自動的にログアウトしました。"
      : sessionReason === "required"
        ? "管理画面を利用するにはログインしてください。"
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "ログインに失敗しました。");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <p className={styles.loginEyebrow}>ADMINISTRATOR</p>
      <h1 id="login-title">管理者ログイン</h1>
      <p className={styles.loginLead}>登録済みの管理者アカウントでログインしてください。</p>

      {sessionMessage && <p className={styles.sessionNotice}>{sessionMessage}</p>}
      {error && <p className={styles.loginError} role="alert">{error}</p>}

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label htmlFor="email">メールアドレス</label>
        <input
          autoComplete="username"
          id="email"
          name="email"
          placeholder="name@example.com"
          required
          type="email"
        />

        <label htmlFor="password">パスワード</label>
        <input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />

        <button disabled={pending} type="submit">
          {pending ? "ログイン中…" : "ログイン"}
        </button>
      </form>
      <p className={styles.timeoutHint}>10分間操作がない場合は自動的にログアウトします。</p>
    </>
  );
}
