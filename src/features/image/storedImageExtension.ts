import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { StoredImage } from './StoredImage';

/**
 * IndexedDB 参照型の画像ノード。
 * 既存の src ベース画像との互換性のため src 属性も保持する。
 */
export const StoredImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      refId: {
        default: null,
        parseHTML: el => (el as HTMLElement).getAttribute('data-ref-id'),
        renderHTML: attrs =>
          attrs.refId ? { 'data-ref-id': attrs.refId as string } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(StoredImage);
  },
});
