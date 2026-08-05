import type { Metadata } from "next";
import Link from "next/link";
import {
  buildCalendarDays,
  calendarHref,
  calendarQuerySchema,
  currentJstMonth,
  getMonthDetails,
} from "@/lib/events/calendar";
import { getPublicCalendarEvents } from "@/lib/events/repository";
import { listOrganizations } from "@/lib/organizations/repository";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "大会カレンダー | Japan Fitness Contest",
  description: "日本国内のフィットネス・ボディビル大会を月間カレンダーで確認できます。",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CalendarEvent = Awaited<ReturnType<typeof getPublicCalendarEvents>>[number];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

function formatPeriod(event: CalendarEvent) {
  return event.startDate === event.endDate
    ? formatDate(event.startDate)
    : `${formatDate(event.startDate)} 〜 ${formatDate(event.endDate)}`;
}

function EventList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return <p className={styles.emptyState}>該当する大会はありません。</p>;
  }

  return (
    <div className={styles.eventList}>
      {events.map((event) => (
        <article className={styles.eventItem} key={event.id}>
          <div>
            <span className={styles.organizationTag}>{event.organization}</span>
            <h3>{event.name}</h3>
            <p>{formatPeriod(event)}</p>
            <p>{event.location}</p>
          </div>
          {event.officialUrl ? (
            <a href={event.officialUrl} rel="noreferrer" target="_blank">
              公式サイト
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default async function EventsCalendarPage({ searchParams }: Props) {
  const raw = await searchParams;
  const parsed = calendarQuerySchema.safeParse({
    month: raw.month,
    organization: raw.organization,
    day: raw.day,
  });
  const currentMonth = currentJstMonth();
  const query = parsed.success ? parsed.data : {};
  const month = query.month ?? currentMonth;
  const monthDetails = getMonthDetails(month);
  const selectedDay =
    query.day && query.day >= monthDetails.firstDate && query.day <= monthDetails.lastDate
      ? query.day
      : undefined;
  const organizationId = query.organization;
  const [events, organizations] = await Promise.all([
    getPublicCalendarEvents({
      firstDate: monthDetails.firstDate,
      lastDate: monthDetails.lastDate,
      organizationId,
    }),
    listOrganizations(),
  ]);
  const calendarDays = buildCalendarDays(month);
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  const selectedEvents = selectedDay
    ? events.filter((event) => event.startDate <= selectedDay && event.endDate >= selectedDay)
    : [];

  return (
    <div className={styles.calendarPage}>
      <header className={styles.pageHeader}>
        <div className={styles.inner}>
          <p>EVENT CALENDAR</p>
          <h1>大会カレンダー</h1>
          <span>公開中の大会を開催月・団体から探せます。</span>
        </div>
      </header>

      <div className={styles.inner}>
        <section className={styles.calendarPanel} aria-labelledby="calendar-title">
          <div className={styles.calendarToolbar}>
            <div className={styles.monthNavigation}>
              <Link
                href={calendarHref({
                  month: monthDetails.previousMonth,
                  organization: organizationId,
                })}
                aria-label="前月を表示"
              >
                ← 前月
              </Link>
              <h2 id="calendar-title" aria-live="polite">
                <span>{monthDetails.year}</span>
                {monthDetails.monthNumber}月
              </h2>
              <Link
                href={calendarHref({
                  month: monthDetails.nextMonth,
                  organization: organizationId,
                })}
                aria-label="次月を表示"
              >
                次月 →
              </Link>
            </div>
            <Link
              className={styles.currentMonthLink}
              href={calendarHref({ month: currentMonth, organization: organizationId })}
            >
              今月
            </Link>
          </div>

          <form className={styles.filters} method="get">
            <input name="month" type="hidden" value={month} />
            <label>
              <span>団体で絞り込む</span>
              <select defaultValue={organizationId ?? ""} name="organization">
                <option value="">すべての団体</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">表示する</button>
            {organizationId ? (
              <Link href={calendarHref({ month })}>絞り込みを解除</Link>
            ) : null}
          </form>

          <div className={styles.calendarScroll}>
            <table className={styles.calendarTable}>
              <caption className={styles.visuallyHidden}>
                {monthDetails.year}年{monthDetails.monthNumber}月の大会カレンダー
              </caption>
              <thead>
                <tr>
                  {weekdays.map((weekday, index) => (
                    <th
                      className={index === 0 ? styles.sunday : index === 6 ? styles.saturday : undefined}
                      key={weekday}
                      scope="col"
                    >
                      {weekday}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: calendarDays.length / 7 }, (_, weekIndex) => (
                  <tr key={weekIndex}>
                    {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date, dayIndex) => {
                      if (!date) return <td className={styles.outsideDay} key={`empty-${dayIndex}`} />;
                      const dayEvents = events.filter(
                        (event) => event.startDate <= date && event.endDate >= date,
                      );
                      const cellClasses = [
                        dayIndex === 0 ? styles.sundayCell : "",
                        dayIndex === 6 ? styles.saturdayCell : "",
                        date === today ? styles.today : "",
                        date === selectedDay ? styles.selectedDay : "",
                      ].filter(Boolean).join(" ");

                      return (
                        <td className={cellClasses} key={date}>
                          <Link
                            className={styles.dayNumber}
                            href={`${calendarHref({ month, organization: organizationId, day: date })}#selected-events`}
                            aria-label={`${formatDate(date)}の大会を表示`}
                          >
                            {Number(date.slice(-2))}
                          </Link>
                          <div className={styles.dayEvents}>
                            {dayEvents.map((event) => (
                              <Link
                                href={`${calendarHref({ month, organization: organizationId, day: date })}#selected-events`}
                                key={event.id}
                                title={event.name}
                              >
                                <span>{event.organization}</span>
                                {event.name}
                              </Link>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedDay ? (
          <section className={styles.eventsSection} id="selected-events" aria-labelledby="selected-title">
            <div className={styles.sectionHeading}>
              <div>
                <p>SELECTED DATE</p>
                <h2 id="selected-title">{formatDate(selectedDay)}</h2>
              </div>
              <span>{selectedEvents.length} EVENTS</span>
            </div>
            <EventList events={selectedEvents} />
          </section>
        ) : null}

        <section className={styles.eventsSection} aria-labelledby="monthly-events-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>MONTHLY EVENTS</p>
              <h2 id="monthly-events-title">{monthDetails.monthNumber}月の大会一覧</h2>
            </div>
            <span>{events.length} EVENTS</span>
          </div>
          <EventList events={events} />
        </section>
      </div>
    </div>
  );
}
