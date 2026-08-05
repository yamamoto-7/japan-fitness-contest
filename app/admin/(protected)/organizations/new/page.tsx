import { OrganizationForm } from "../organization-form";
import styles from "../../../admin.module.css";

export default function NewAdminOrganizationPage() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>NEW ORGANIZATION</p><h1>団体を登録</h1></div>
      </div>
      <OrganizationForm />
    </main>
  );
}
