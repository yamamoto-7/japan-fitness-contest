import Link from "next/link";
import { listAdminEvents } from "@/lib/events/repository";
import { adminEventQuerySchema } from "@/lib/events/validation";
import { EventActions } from "./event-actions";
import styles from "../../admin.module.css";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = adminEventQuerySchema.safeParse({
    page: raw.page,
    limit: 20,
    published: raw.published,
    q: raw.q,
  });
  const query = parsed.success ? parsed.data : { page: 1, limit: 20 };
  const result = await listAdminEvents(query);
  const statusMessage = raw.status === "created" ? "大会を登録しました。" : raw.status === "updated" ? "大会を更新しました。" : null;
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (query.q) params.set("q", query.q);
    if (query.published) params.set("published", query.published);
    return `/admin/events?${params.toString()}`;
  };

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>EVENT MANAGEMENT</p><h1>大会管理</h1></div>
        <Link className={styles.primaryButton} href="/admin/events/new">大会を登録</Link>
      </div>
      {statusMessage ? <p className={styles.successNotice}>{statusMessage}</p> : null}
      <form className={styles.filterBar}>
        <input defaultValue={typeof raw.q === "string" ? raw.q : ""} name="q" placeholder="大会名・開催地で検索" />
        <select defaultValue={typeof raw.published === "string" ? raw.published : ""} name="published">
          <option value="">すべての公開状態</option>
          <option value="true">公開</option>
          <option value="false">非公開</option>
        </select>
        <button type="submit">検索</button>
      </form>
      <section className={styles.eventTablePanel} aria-label="大会一覧">
        {result.data.length === 0 ? (
          <p className={styles.emptyState}>条件に一致する大会はありません。</p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.eventTable}>
              <thead><tr><th>大会名 / 団体</th><th>開催期間</th><th>開催地</th><th>状態</th><th>更新日時</th><th>操作</th></tr></thead>
              <tbody>
                {result.data.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.name}</strong><small>{event.organization}</small></td>
                    <td>{event.startDate === event.endDate ? event.startDate : `${event.startDate} 〜 ${event.endDate}`}</td>
                    <td>{event.location}</td>
                    <td><span className={event.isPublished ? styles.publishedBadge : styles.draftBadge}>{event.isPublished ? "公開" : "非公開"}</span></td>
                    <td><time dateTime={event.updatedAt.toISOString()}>{event.updatedAt.toLocaleString("ja-JP")}</time></td>
                    <td><EventActions id={event.id} isPublished={event.isPublished} name={event.name} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {result.meta.totalPages > 1 ? (
        <nav className={styles.pagination} aria-label="ページネーション">
          {query.page > 1 ? <Link href={pageHref(query.page - 1)}>前へ</Link> : <span>前へ</span>}
          <small>{query.page} / {result.meta.totalPages}</small>
          {query.page < result.meta.totalPages ? <Link href={pageHref(query.page + 1)}>次へ</Link> : <span>次へ</span>}
        </nav>
      ) : null}
    </main>
  );
}
