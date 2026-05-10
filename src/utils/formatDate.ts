function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isYesterday(a: Date, now: Date): boolean {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return sameDay(a, y);
}

export function formatDateSmart(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return 'たった今';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分前`;
  if (sameDay(d, now)) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday(d, now)) {
    return `昨日 ${d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}
