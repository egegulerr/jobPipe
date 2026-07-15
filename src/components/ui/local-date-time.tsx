"use client";

import { useSyncExternalStore } from "react";

type LocalDateTimePreset = "date" | "dateTime" | "shortDateTime";

type LocalDateTimeProps = {
  value: string;
  preset?: LocalDateTimePreset;
  className?: string;
  invalidFallback?: string;
};

const formatOptionsByPreset: Record<LocalDateTimePreset, Intl.DateTimeFormatOptions> = {
  date: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  dateTime: {
    dateStyle: "medium",
    timeStyle: "short",
  },
  shortDateTime: {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

function formatDateTime(
  value: Date,
  preset: LocalDateTimePreset,
  locale: string | string[] | undefined,
  timeZone?: string,
) {
  const formatOptions = formatOptionsByPreset[preset];
  const formatter = new Intl.DateTimeFormat(locale, {
    ...formatOptions,
    ...(timeZone ? { timeZone } : {}),
  });

  return formatter.format(value);
}

function subscribe() {
  return () => undefined;
}

export function LocalDateTime({
  value,
  preset = "date",
  className,
  invalidFallback = value,
}: LocalDateTimeProps) {
  const parsedValue = new Date(value);
  const isValidDate = !Number.isNaN(parsedValue.getTime());

  const serverSafeText = isValidDate
    ? formatDateTime(parsedValue, preset, "en-GB", "UTC")
    : invalidFallback;

  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const displayText = isHydrated && isValidDate
    ? formatDateTime(parsedValue, preset, undefined)
    : serverSafeText;

  return (
    <time className={className} dateTime={isValidDate ? parsedValue.toISOString() : undefined}>
      {displayText}
    </time>
  );
}
