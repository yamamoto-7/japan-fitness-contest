import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/organizations/repository";
import { organizationIdSchema } from "@/lib/organizations/validation";
import { OrganizationForm } from "../../organization-form";
import styles from "../../../../admin.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdminOrganizationPage({ params }: Props) {
  const { id } = await params;
  if (!organizationIdSchema.safeParse(id).success) notFound();
  const organization = await getOrganization(id);
  if (!organization) notFound();

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>EDIT ORGANIZATION</p><h1>団体を編集</h1></div>
      </div>
      <OrganizationForm initialName={organization.name} organizationId={organization.id} />
    </main>
  );
}
