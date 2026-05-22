import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCaseStudies } from '@/lib/mdx';

export const metadata = buildMetadata({
  title: 'Recent Pipedrive Projects',
  description:
    'A selection of recent Pipedrive, Zapier and Active Campaign projects — sales process, automation and integration work for businesses of all sizes.',
  path: '/projects/',
});

const OTHER_PROJECTS = [
  'Native iOS and Android app developed for Formby Fitness gym. Integrated with existing platform to allow members to book fitness classes. Receiving in excess of 30,000 opens/month.',
  'Web based interface for enterprise client. Collates all management reports, assigns relevant staff members and automatically notifies key departments.',
  "Custom Windows application designed and built to allow local barbers to track staff productivity. Staff input service provided, software opens till draw, prints receipt and populates Google Forms to provide management statistics.",
  'Creating multiple Pipedrive Workflows and Automations enabling functionality such as automated movement of deals, based on prospect lead scoring. Saving the agency hours every week in repetitive admin tasks whilst ensuring each lead is followed up quickly and effectively.',
  "Complex data cleanse and import. Our partner had multiple lead sources with many duplicates and custom fields. An essential requirement was to add timezones to Pipedrive ensuring agents would call within working hours.",
  'A professional website to showcase an agencies work. Developed in WordPress to allow quick updates as required.',
  "Web App developed for IBM's annual team building event. Allowed staff to record hundreds of videos of team building events and upload to management interface for judging.",
  'Mobile app on iPhone / iPad and Android. Allows staff to report safety concerns, submitting GPS location, images and descriptions. Management interface displays all reports, alerts relevant stakeholders and assigns resources to action.',
];

export default function Page() {
  const studies = getAllCaseStudies();
  return (
    <>
      <PageHero
        eyebrow="Innovative work"
        heading="Recent projects."
        lead="View a selection of recent Pipedrive, Zapier and Active Campaign projects. We work with businesses of all sizes from sole traders to multi-nationals. If you want to increase sales whilst reducing your administrative burden, get in touch."
      />

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Case studies</span>
          <h2>Featured projects.</h2>
          {studies.length === 0 ? (
            <p style={{ marginTop: 20 }}>Case studies coming soon.</p>
          ) : (
            <div className="as-grid-2" style={{ marginTop: 40 }}>
              {studies.map((s) => (
                <article key={s.slug} className="as-card">
                  {s.frontmatter.ogImage && (
                    <Link href={`/${s.slug}/`} className="as-card-image">
                      <Image
                        src={s.frontmatter.ogImage}
                        alt={s.frontmatter.title}
                        width={1000}
                        height={750}
                        sizes="(max-width:700px) 100vw, 500px"
                      />
                    </Link>
                  )}
                  <span className="as-tag">{s.frontmatter.category || 'Case study'}</span>
                  <h3><Link href={`/${s.slug}/`}>{s.frontmatter.title}</Link></h3>
                  <p>{s.frontmatter.description}</p>
                  <p style={{ marginTop: 16 }}>
                    <Link className="as-btn as-btn-secondary" href={`/${s.slug}/`}>Read case study →</Link>
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">More work</span>
          <h2>Other recent projects.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {OTHER_PROJECTS.map((p, i) => (
              <article key={i} className="as-card">
                <p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBox
        heading="Don't be shy, say hello."
        body="Tell us about your project and we'll work with you to understand your business and how we can help."
        primary={{ href: '/contact-2/', label: 'Contact us →' }}
      />
    </>
  );
}
