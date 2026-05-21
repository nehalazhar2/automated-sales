import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export function professionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    sameAs: [
      'https://www.linkedin.com/company/automated-sales/',
    ],
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  author?: string;
  image?: string;
}) {
  const url = `${SITE_URL}/${input.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    dateModified: input.updated || input.date,
    image: input.image || `${SITE_URL}/og?title=${encodeURIComponent(input.title)}`,
    author: {
      '@type': 'Organization',
      name: input.author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
