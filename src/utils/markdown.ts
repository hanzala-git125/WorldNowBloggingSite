import { marked } from 'marked';

export function renderMarkdown(content: string, fallbackAltText?: string) {
  const raw = (content || '')
    .replace(/(^|\n)\s*---\s*(?=\n|$)/g, '\n\n')
    .trim();

  if (!raw) {
    return '';
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const html = looksLikeHtml
    ? raw
    : (marked.parse(raw, {
        gfm: true,
        breaks: true,
      }) as string);

  if (fallbackAltText) {
    const escapedAltText = fallbackAltText
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return html.replace(/<img\b([^>]*?)>/gi, (image, attributes: string) => {
      if (/\balt\s*=/i.test(attributes)) return image;
      return `<img alt="${escapedAltText}"${attributes}>`;
    });
  }

  return html;
}
