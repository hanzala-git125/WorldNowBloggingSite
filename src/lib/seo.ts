import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site';

type ArticleMetadataParams = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  author?: string | null;
  tags?: string[] | null;
  noIndex?: boolean;
};

export function resolveAbsoluteUrl(value?: string | null): string {
  if (!value) {
    return new URL(DEFAULT_OG_IMAGE, SITE_URL).toString();
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value.startsWith('/') ? value : `/${value}`, SITE_URL).toString();
}

export function buildArticleJsonLd({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
  tags,
}: Omit<ArticleMetadataParams, 'noIndex'>) {
  const resolvedTitle = title || SITE_NAME;
  const resolvedDescription = description || `Read more on ${SITE_NAME}.`;
  const resolvedImage = resolveAbsoluteUrl(image);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: resolvedTitle,
    description: resolvedDescription,
    image: resolvedImage,
    url,
    author: {
      '@type': 'Person',
      name: author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: resolveAbsoluteUrl(DEFAULT_OG_IMAGE),
      },
    },
    datePublished: publishedTime || undefined,
    dateModified: modifiedTime || publishedTime || undefined,
    keywords: tags && tags.length > 0 ? tags.join(', ') : undefined,
  };
}

export function buildArticleMetadata({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
  tags,
  noIndex = false,
}: ArticleMetadataParams): Metadata {
  const resolvedTitle = title || SITE_NAME;
  const resolvedDescription = description || `Read more on ${SITE_NAME}.`;
  const resolvedImage = resolveAbsoluteUrl(image);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      type: 'article',
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
      publishedTime: publishedTime || undefined,
      modifiedTime: modifiedTime || undefined,
      authors: author ? [author] : undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
    },
    authors: author ? [{ name: author }] : undefined,
  };
}
