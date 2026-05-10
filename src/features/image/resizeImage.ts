/**
 * 画像をリサイズ・圧縮して Blob で返す。
 * - 長辺 maxDim 以下に収まるように縮小（拡大はしない）
 * - 出力は WebP (品質 quality)
 * - OffscreenCanvas が無いブラウザでは通常 canvas にフォールバック
 */
export async function resizeImage(
  file: File | Blob,
  maxDim = 1600,
  quality = 0.82,
): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context が取得できません');
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    try {
      return await canvas.convertToBlob({ type: 'image/webp', quality });
    } catch {
      return await canvas.convertToBlob({ type: 'image/jpeg', quality });
    }
  }

  // Fallback for older browsers
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context が取得できません');
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('画像のエンコードに失敗しました'))),
      'image/webp',
      quality,
    );
  });
}
