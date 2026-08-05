import Link from "next/link";
import { getAdminDashboard } from "@/lib/events/repository";
import styles from "../admin.module.css";

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();
  const summaryCards = [
    { label: "大会総数", value: dashboard.total, unit: "件" },
    { label: "公開中大会", value: dashboard.published, unit: "件" },
    { label: "非公開大会", value: dashboard.unpublished, unit: "件" },
    { label: "今後の大会", value: dashboard.upcoming, unit: "件" },
  ];

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div>
          <p>DASHBOARD</p>
          <h1>ダッシュボード</h1>
        </div>
        <Link className={styles.primaryButton} href="/admin/events/new">大会を登録</Link>
      </div>

      <div className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}<small>{card.unit}</small></strong>
          </article>
        ))}
      </div>

      <section className={styles.dashboardSection} aria-labelledby="recent-events-title">
        <div>
          <h2 id="recent-events-title">最近更新した大会</h2>
          <span>RECENT EVENTS</span>
        </div>
        {dashboard.recent.length === 0 ? (
          <p className={styles.emptyState}>登録されている大会はありません。</p>
        ) : (
          <div className={styles.recentList}>
            {dashboard.recent.map((event) => (
              <Link href={`/admin/events/${event.id}/edit`} key={event.id}>
                <span>
                  <strong>{event.name}</strong>
                  <small>{event.organization} · {event.location}</small>
                </span>
                <time dateTime={event.updatedAt.toISOString()}>
                  {event.updatedAt.toLocaleString("ja-JP")}
                </time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
