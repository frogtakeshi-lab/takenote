interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TipTapNode {
  type: string;
  text?: string;
  marks?: TipTapMark[];
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
}

function applyMarks(text: string, marks: TipTapMark[]): string {
  let result = text;
  for (const mark of marks) {
    if (mark.type === 'bold') result = `**${result}**`;
    else if (mark.type === 'italic') result = `*${result}*`;
    else if (mark.type === 'strike') result = `~~${result}~~`;
    else if (mark.type === 'code') result = `\`${result}\``;
    else if (mark.type === 'highlight') result = `==${result}==`;
  }
  return result;
}

function inlineContent(nodes: TipTapNode[]): string {
  return nodes.map(node => {
    if (node.type === 'text') {
      const text = node.text ?? '';
      return node.marks ? applyMarks(text, node.marks) : text;
    }
    if (node.type === 'hardBreak') return '  \n';
    return '';
  }).join('');
}

function nodeToMarkdown(node: TipTapNode, indent = 0, index = 0): string {
  const pad = '  '.repeat(indent);

  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(n => nodeToMarkdown(n)).join('\n');

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const prefix = '#'.repeat(level);
      const text = inlineContent(node.content ?? []);
      return `${prefix} ${text}\n`;
    }

    case 'paragraph': {
      const text = inlineContent(node.content ?? []);
      return text ? `${text}\n` : '\n';
    }

    case 'bulletList':
      return (node.content ?? []).map(li => nodeToMarkdown(li, indent, 0)).join('') + '\n';

    case 'orderedList':
      return (node.content ?? []).map((li, i) => nodeToMarkdown(li, indent, i + 1)).join('') + '\n';

    case 'taskList':
      return (node.content ?? []).map(li => nodeToMarkdown(li, indent, 0)).join('') + '\n';

    case 'listItem': {
      const bullet = index === 0 ? '-' : `${index}.`;
      const children = node.content ?? [];
      const firstPara = children[0];
      const firstText = firstPara?.content ? inlineContent(firstPara.content) : '';
      const rest = children.slice(1).map(n => nodeToMarkdown(n, indent + 1)).join('');
      return `${pad}${bullet} ${firstText}\n${rest}`;
    }

    case 'taskItem': {
      const checked = node.attrs?.checked === true;
      const checkbox = checked ? '[x]' : '[ ]';
      const children = node.content ?? [];
      const firstPara = children[0];
      const firstText = firstPara?.content ? inlineContent(firstPara.content) : '';
      const rest = children.slice(1).map(n => nodeToMarkdown(n, indent + 1)).join('');
      return `${pad}- ${checkbox} ${firstText}\n${rest}`;
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map(n => nodeToMarkdown(n)).join('');
      return inner.split('\n').filter(Boolean).map(l => `> ${l}`).join('\n') + '\n\n';
    }

    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? '';
      const code = (node.content ?? []).map(n => n.text ?? '').join('');
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case 'horizontalRule':
      return '---\n\n';

    case 'image': {
      const alt = (node.attrs?.alt as string) ?? '画像';
      const src = (node.attrs?.src as string) ?? '';
      const refId = (node.attrs?.refId as string) ?? '';
      // refId 参照型はアプリ外で解決できないので、参照 URL を残す
      const url = src || (refId ? `image:${refId}` : '');
      return `![${alt}](${url})\n\n`;
    }

    default:
      return '';
  }
}

export function noteToMarkdown(title: string, content: string): string {
  let doc: TipTapNode;
  try {
    doc = JSON.parse(content) as TipTapNode;
  } catch {
    return `# ${title}\n\n${content}`;
  }

  const body = nodeToMarkdown(doc).trim();
  return `# ${title}\n\n${body}\n`;
}

export function downloadMarkdown(title: string, content: string): void {
  const md = noteToMarkdown(title, content);
  const blob = new Blob([md], { type: 'text/markdown; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'note'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
