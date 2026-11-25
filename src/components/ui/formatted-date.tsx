"use client";

import { format, isToday, isYesterday } from "date-fns";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Server and browser can be in different time zones. SSR and hydration render
// a neutral UTC date, then the client switches to the local label, which
// avoids a hydration mismatch.
export function FormattedDate({ date }: { date: Date }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const label = isClient ? formatLocal(date) : formatUtc(date);

  return (
    <time
      dateTime={date.toISOString()}
      title={isClient ? date.toLocaleString() : undefined}
    >
      {label}
    </time>
  );
}

function formatLocal(date: Date) {
  if (isToday(date)) return `Today at ${format(date, "HH:mm")}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, "HH:mm")}`;
  return format(date, "d MMM yyyy");
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatUtc(date: Date) {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
