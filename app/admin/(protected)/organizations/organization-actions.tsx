"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../admin.module.css";

type Props = { id: string; name: string; eventCount: number };

export function OrganizationActions({ id, name, eventCount }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isInUse = eventCount > 0;

  async function remove() {
    if (isInUse) return;
    if (!window.confirm(`「${name}」を削除します。この操作は元に戻せません。`)) return;

    setIsPending(true);
    const response = await fetch(`/api/admin/organizations/${id}`, { method: "DELETE" });
    setIsPending(false);
    if (response.ok) router.refresh();
    else {
      const result = await response.json();
      window.alert(result?.error?.message ?? "削除に失敗しました。");
    }
  }

  return (
    <div className={styles.rowActions}>
      <Link href={`/admin/organizations/${id}/edit`}>編集</Link>
      <button
        className={styles.dangerAction}
        disabled={isPending || isInUse}
        onClick={remove}
        title={isInUse ? "大会に使用されているため削除できません" : undefined}
        type="button"
      >
        削除
      </button>
    </div>
  );
}
