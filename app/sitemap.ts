import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getAllPosts, getAllCaseStudies } from '@/lib/mdx';

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/',                                              priority: 1.0, changeFrequency: 'monthly' },
  { path: '/pipedrive-consultant/',                         priority: 0.9, changeFrequency: 'monthly' },
  { path: '/ai-consultants/',                               priority: 0.9, changeFrequency: 'monthly' },
  { path: '/zapier-consultants/',                           priority: 0.8, changeFrequency: 'monthly' },
  { path: '/active-campaign-consultants/',                  priority: 0.8, changeFrequency: 'monthly' },
  { path: '/pipedrive-zapier-active-campaign-services/',    priority: 0.9, changeFrequency: 'monthly' },
  { path: '/projects/',                                     priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about-2/',                                      priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact-2/',                                    priority: 0.7, changeFrequency: 'yearly' },
  { path: '/blog/',                                         priority: 0.7, changeFrequency: 'weekly' },
  { path: '/testimonials/',                                 priority: 0.6, changeFrequency: 'monthly' },
  { path: '/free-pipedrive-trial-extended/',                priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-expert/',                             priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-implementation/',                     priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-setup/',                              priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-help/',                               priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-training/',                           priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-integration/',                        priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-automation/',                         priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pipedrive-partner/',                            priority: 0.7, changeFrequency: 'monthly' },
  { path: '/privacy/',                                      priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${SITE_URL}/${p.slug}/`,
    lastModified: new Date(p.frontmatter.updated || p.frontmatter.date),
    changeFrequency: 'monthly',
    priority: p.frontmatter.noIndex ? 0.3 : 0.7,
  }));

  const caseStudyEntries: MetadataRoute.Sitemap = getAllCaseStudies().map((p) => ({
    url: `${SITE_URL}/${p.slug}/`,
    lastModified: new Date(p.frontmatter.updated || p.frontmatter.date),
    changeFrequency: 'monthly',
    priority: p.frontmatter.noIndex ? 0.3 : 0.7,
  }));

  return [...staticEntries, ...postEntries, ...caseStudyEntries];
}
