import { EventForm } from "../event-form";
import styles from "../../../admin.module.css";

export default function NewAdminEventPage() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>NEW EVENT</p><h1>大会を登録</h1></div>
      </div>
      <EventForm />
    </main>
  );
}
