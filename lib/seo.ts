import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './site';

type BuildMetadataInput = {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const description = input.description?.trim() || SITE_DESCRIPTION;
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = input.ogImage || `${SITE_URL}/og?title=${encodeURIComponent(input.title)}`;

  return {
    title: input.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: input.type || 'website',
      url: canonical,
      title: input.title,
      description,
      siteName: SITE_NAME,
      locale: 'en_GB',
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}
