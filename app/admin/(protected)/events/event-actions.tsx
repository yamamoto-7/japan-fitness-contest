"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../admin.module.css";

type Props = {
  id: string;
  name: string;
  isPublished: boolean;
};

export function EventActions({ id, name, isPublished }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function updatePublication() {
    setIsPending(true);
    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setIsPending(false);
    if (response.ok) router.refresh();
    else window.alert("公開状態の変更に失敗しました。");
  }

  async function remove() {
    if (!window.confirm(`「${name}」を削除します。この操作は元に戻せません。`)) return;
    setIsPending(true);
    const response = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setIsPending(false);
    if (response.ok) router.refresh();
    else window.alert("削除に失敗しました。");
  }

  return (
    <div className={styles.rowActions}>
      <Link href={`/admin/events/${id}/edit`}>編集</Link>
      <button disabled={isPending} onClick={updatePublication} type="button">
        {isPublished ? "非公開にする" : "公開する"}
      </button>
      <button className={styles.dangerAction} disabled={isPending} onClick={remove} type="button">
        削除
      </button>
    </div>
  );
}
