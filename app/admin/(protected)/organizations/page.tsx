import Link from "next/link";
import { listAdminOrganizations } from "@/lib/organizations/repository";
import { OrganizationActions } from "./organization-actions";
import styles from "../../admin.module.css";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminOrganizationsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const organizations = await listAdminOrganizations();
  const statusMessage =
    raw.status === "created"
      ? "団体を登録しました。"
      : raw.status === "updated"
        ? "団体を更新しました。"
        : null;

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>ORGANIZATION MANAGEMENT</p><h1>団体管理</h1></div>
        <Link className={styles.primaryButton} href="/admin/organizations/new">団体を登録</Link>
      </div>
      {statusMessage ? <p className={styles.successNotice}>{statusMessage}</p> : null}
      <section className={styles.eventTablePanel} aria-label="団体一覧">
        {organizations.length === 0 ? (
          <p className={styles.emptyState}>登録されている団体はありません。</p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.eventTable}>
              <thead>
                <tr><th>団体名</th><th>大会数</th><th>更新日時</th><th>操作</th></tr>
              </thead>
              <tbody>
                {organizations.map((organization) => (
                  <tr key={organization.id}>
                    <td><strong>{organization.name}</strong></td>
                    <td>{organization.eventCount}件</td>
                    <td>
                      <time dateTime={organization.updatedAt.toISOString()}>
                        {organization.updatedAt.toLocaleString("ja-JP")}
                      </time>
                    </td>
                    <td>
                      <OrganizationActions
                        eventCount={organization.eventCount}
                        id={organization.id}
                        name={organization.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
