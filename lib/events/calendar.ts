import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const daySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);

export const calendarQuerySchema = z.object({
  month: monthSchema.optional(),
  organization: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  day: daySchema.optional(),
});

export function currentJstMonth() {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date());
}

export function getMonthDetails(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const last = new Date(Date.UTC(year, monthNumber, 0));
  const previous = new Date(Date.UTC(year, monthNumber - 2, 1));
  const next = new Date(Date.UTC(year, monthNumber, 1));
  const toMonth = (date: Date) => date.toISOString().slice(0, 7);

  return {
    year,
    monthNumber,
    firstDate: first.toISOString().slice(0, 10),
    lastDate: last.toISOString().slice(0, 10),
    previousMonth: toMonth(previous),
    nextMonth: toMonth(next),
    daysInMonth: last.getUTCDate(),
    leadingDays: first.getUTCDay(),
  };
}

export function buildCalendarDays(month: string) {
  const details = getMonthDetails(month);
  const cellCount = Math.ceil((details.leadingDays + details.daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - details.leadingDays + 1;
    if (day < 1 || day > details.daysInMonth) return null;
    return `${month}-${String(day).padStart(2, "0")}`;
  });
}

export function calendarHref({
  month,
  organization,
  day,
}: {
  month: string;
  organization?: string;
  day?: string;
}) {
  const params = new URLSearchParams({ month });
  if (organization) params.set("organization", organization);
  if (day) params.set("day", day);
  return `/events?${params.toString()}`;
}
