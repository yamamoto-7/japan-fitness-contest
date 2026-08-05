import { EventForm } from "../event-form";
import { listOrganizations } from "@/lib/organizations/repository";
import styles from "../../../admin.module.css";

export default async function NewAdminEventPage() {
  const organizations = await listOrganizations();

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>NEW EVENT</p><h1>大会を登録</h1></div>
      </div>
      <EventForm organizations={organizations} />
    </main>
  );
}
