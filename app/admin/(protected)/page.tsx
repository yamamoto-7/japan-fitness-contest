import styles from "../admin.module.css";

const summaryCards = [
  { label: "大会総数", value: "0", unit: "件" },
  { label: "公開中大会", value: "0", unit: "件" },
  { label: "非公開大会", value: "0", unit: "件" },
  { label: "今後の大会", value: "0", unit: "件" },
];

export default function AdminDashboardPage() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div>
          <p>DASHBOARD</p>
          <h1>ダッシュボード</h1>
        </div>
        <button disabled type="button">大会を登録</button>
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
        <p className={styles.emptyState}>登録されている大会はありません。</p>
      </section>
    </main>
  );
}

