"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "../../admin.module.css";

type Props = {
  organizationId?: string;
  initialName?: string;
};

export function OrganizationForm({ organizationId, initialName = "" }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(
        organizationId
          ? `/api/admin/organizations/${organizationId}`
          : "/api/admin/organizations",
        {
          method: organizationId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.get("name") }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        const detail = result?.error?.details?.[0]?.message;
        throw new Error(detail ?? result?.error?.message ?? "保存に失敗しました。");
      }

      router.push(`/admin/organizations?status=${organizationId ? "updated" : "created"}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.eventForm} onSubmit={handleSubmit}>
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
      <div className={styles.formGrid}>
        <label className={styles.fullField}>
          <span>団体名 *</span>
          <input autoFocus defaultValue={initialName} maxLength={100} name="name" required />
        </label>
      </div>
      <div className={styles.formActions}>
        <Link className={styles.secondaryButton} href="/admin/organizations">キャンセル</Link>
        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
