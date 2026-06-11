/**
 * Locale-aware formatting utilities.
 *
 * All formatters accept an optional locale parameter. When omitted,
 * they use the browser's default locale (which react-intl sets based
 * on the current IntlProvider locale).
 */

export const formatDate = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date);

export const formatNumber = (value: number, locale?: string, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(value);

export const formatCurrency = (value: number, currency = 'USD', locale?: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

const RELATIVE_TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Infinity, unit: 'year' },
];

// Server timestamps are naive UTC wall-clock strings (no offset/zone suffix).
// Treat any date-time string without a timezone designator as UTC.
export const parseServerDate = (value: string): Date =>
  new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);

// Renders a date as "2 hours ago" / "in 3 days" etc., localized via Intl.RelativeTimeFormat.
export const formatRelativeTime = (date: Date, locale?: string): string => {
  let duration = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const division of RELATIVE_TIME_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), 'year');
};
