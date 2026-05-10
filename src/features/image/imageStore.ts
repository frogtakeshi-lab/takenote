import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';

const PREFIX = 'img:';

export async function saveImage(id: string, blob: Blob): Promise<void> {
  await idbSet(PREFIX + id, blob);
}

export async function loadImage(id: string): Promise<Blob | undefined> {
  return idbGet<Blob>(PREFIX + id);
}

export async function deleteImage(id: string): Promise<void> {
  await idbDel(PREFIX + id);
}

export async function deleteImages(ids: string[]): Promise<void> {
  await Promise.all(ids.map(deleteImage));
}

export async function listImageIds(): Promise<string[]> {
  const all = await idbKeys();
  return all
    .filter((k): k is string => typeof k === 'string' && k.startsWith(PREFIX))
    .map(k => k.slice(PREFIX.length));
}

/**
 * ノートコンテンツ JSON 文字列から refId を抽出する。
 */
export function extractImageRefIds(content: string): string[] {
  if (!content) return [];
  const ids: string[] = [];
  try {
    const doc = JSON.parse(content) as { type?: string; attrs?: { refId?: string }; content?: unknown[] };
    function walk(node: { type?: string; attrs?: { refId?: string }; content?: unknown[] }) {
      if (node.type === 'image' && node.attrs?.refId) ids.push(node.attrs.refId);
      if (node.content) (node.content as typeof node[]).forEach(walk);
    }
    walk(doc);
  } catch { /* noop */ }
  return ids;
}
