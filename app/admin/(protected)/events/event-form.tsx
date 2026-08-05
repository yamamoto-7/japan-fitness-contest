"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "../../admin.module.css";

export type EventFormValues = {
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  officialUrl: string | null;
  description: string | null;
  isPublished: boolean;
};

type Props = {
  eventId?: string;
  initialValues?: EventFormValues;
};

const emptyValues: EventFormValues = {
  name: "",
  organization: "",
  startDate: "",
  endDate: "",
  location: "",
  officialUrl: null,
  description: null,
  isPublished: false,
};

export function EventForm({ eventId, initialValues = emptyValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = {
      name: formData.get("name"),
      organization: formData.get("organization"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      location: formData.get("location"),
      officialUrl: formData.get("officialUrl"),
      description: formData.get("description"),
      isPublished: formData.get("isPublished") === "on",
    };

    try {
      const response = await fetch(eventId ? `/api/admin/events/${eventId}` : "/api/admin/events", {
        method: eventId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        const detail = result?.error?.details?.[0]?.message;
        throw new Error(detail ?? result?.error?.message ?? "保存に失敗しました。");
      }

      router.push(`/admin/events?status=${eventId ? "updated" : "created"}`);
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
          <span>大会名 *</span>
          <input defaultValue={initialValues.name} maxLength={200} name="name" required />
        </label>
        <label>
          <span>団体名 *</span>
          <input defaultValue={initialValues.organization} maxLength={100} name="organization" required />
        </label>
        <label>
          <span>開催地 *</span>
          <input defaultValue={initialValues.location} maxLength={255} name="location" required />
        </label>
        <label>
          <span>開始日 *</span>
          <input defaultValue={initialValues.startDate} name="startDate" required type="date" />
        </label>
        <label>
          <span>終了日 *</span>
          <input defaultValue={initialValues.endDate} name="endDate" required type="date" />
        </label>
        <label className={styles.fullField}>
          <span>公式URL</span>
          <input defaultValue={initialValues.officialUrl ?? ""} name="officialUrl" placeholder="https://example.com" type="url" />
        </label>
        <label className={styles.fullField}>
          <span>説明・注意事項</span>
          <textarea defaultValue={initialValues.description ?? ""} maxLength={10000} name="description" rows={7} />
        </label>
        <label className={`${styles.fullField} ${styles.checkboxField}`}>
          <input defaultChecked={initialValues.isPublished} name="isPublished" type="checkbox" />
          <span>公開する</span>
        </label>
      </div>
      <div className={styles.formActions}>
        <Link className={styles.secondaryButton} href="/admin/events">キャンセル</Link>
        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
