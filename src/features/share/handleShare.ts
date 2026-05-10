interface SharedPayload {
  title: string;
  text: string;
  url: string;
  receivedAt: number;
}

const SHARE_CACHE = 'share-inbox-v1';
const SHARE_KEY = '/__pending_share';

export async function consumePendingShare(): Promise<SharedPayload | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(SHARE_CACHE);
    const res = await cache.match(SHARE_KEY);
    if (!res) return null;
    const data = (await res.json()) as SharedPayload;
    await cache.delete(SHARE_KEY);
    return data;
  } catch (e) {
    console.error('共有データの読み出しに失敗', e);
    return null;
  }
}

export function buildSharedNoteContent(data: SharedPayload): { title: string; bodyText: string } {
  const title = data.title?.trim() || (data.url ? extractDomain(data.url) : '共有メモ');
  const parts: string[] = [];
  if (data.text) parts.push(data.text);
  if (data.url) parts.push(data.url);
  return { title, bodyText: parts.join('\n\n') };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '共有メモ';
  }
}
