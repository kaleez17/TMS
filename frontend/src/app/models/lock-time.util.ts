/** Max time a test stays Locked. The server releases it (2 -> 0) after this. */
export const LOCK_LIMIT_SECONDS = 24 * 60 * 60;

/** "23h 59m" style text from the server-calculated seconds. Never shows more than 24h. */
export function formatLockRemaining(seconds?: number | null): string {
  const secs = Math.max(0, Math.min(LOCK_LIMIT_SECONDS, Number(seconds ?? LOCK_LIMIT_SECONDS)));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours === 0 && minutes === 0) return 'less than a minute';
  return `${hours}h ${minutes}m`;
}
