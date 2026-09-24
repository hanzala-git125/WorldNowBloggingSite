'use client';

import AdsterraNative from './AdsterraNative';
import AdsterraResponsiveBanner from './AdsterraResponsiveBanner';

interface AdsterraArticleContentProps {
  html: string;
  articleKey: string;
}

function splitParagraphs(html: string) {
  const paragraphs = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);

  if (!paragraphs || paragraphs.length === 0) {
    return [{ html, paragraphIndex: 0 }];
  }

  const parts: Array<{ html: string; paragraphIndex: number }> = [];
  let cursor = 0;

  paragraphs.forEach((paragraph, index) => {
    const start = html.indexOf(paragraph, cursor);
    parts.push({ html: html.slice(cursor, start + paragraph.length), paragraphIndex: index + 1 });
    cursor = start + paragraph.length;
  });

  if (cursor < html.length) {
    parts.push({ html: html.slice(cursor), paragraphIndex: paragraphs.length });
  }

  return parts;
}

export default function AdsterraArticleContent({ html, articleKey }: AdsterraArticleContentProps) {
  const parts = splitParagraphs(html);
  const paragraphCount = parts[parts.length - 1]?.paragraphIndex || 0;
  const firstAdAfter = paragraphCount >= 4 ? 4 : Math.max(1, Math.ceil(paragraphCount / 2));
  const secondAdAfter = paragraphCount >= 8 ? 8 : Math.max(firstAdAfter + 1, paragraphCount);
  let renderedParagraphs = 0;

  return (
    <>
      {parts.map((part, index) => {
        const previousParagraphs = renderedParagraphs;
        renderedParagraphs = Math.max(renderedParagraphs, part.paragraphIndex);
        const ads = [];

        if (paragraphCount === 0 && index === parts.length - 1) {
          ads.push(
            <AdsterraNative
              key={`first-${articleKey}`}
            />,
            <AdsterraResponsiveBanner
              key={`second-${articleKey}`}
            />,
          );
        }

        if (part.paragraphIndex >= firstAdAfter && previousParagraphs < firstAdAfter) {
          ads.push(
            <AdsterraNative
              key={`first-${articleKey}`}
            />,
          );
        }

        if (part.paragraphIndex >= secondAdAfter && previousParagraphs < secondAdAfter) {
          ads.push(
            <AdsterraResponsiveBanner
              key={`second-${articleKey}`}
            />,
          );
        }

        return (
          <div key={`content-${index}`}>
            <div dangerouslySetInnerHTML={{ __html: part.html }} />
            {ads}
          </div>
        );
      })}
    </>
  );
}