import { notFound } from "next/navigation";
import { getAdminEvent } from "@/lib/events/repository";
import { eventIdSchema } from "@/lib/events/validation";
import { EventForm } from "../../event-form";
import styles from "../../../../admin.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdminEventPage({ params }: Props) {
  const { id } = await params;
  if (!eventIdSchema.safeParse(id).success) notFound();
  const event = await getAdminEvent(id);
  if (!event) notFound();

  return (
    <main className={styles.dashboard}>
      <div className={styles.dashboardHeading}>
        <div><p>EDIT EVENT</p><h1>大会を編集</h1></div>
      </div>
      <EventForm eventId={event.id} initialValues={event} />
    </main>
  );
}
