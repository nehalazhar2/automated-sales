import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Website Design — Company Websites Built In 48 Hours',
  description:
    'Fast, affordable, SEO-optimised company websites built in 48 hours. Company profile sites that load fast and rank well — from a Pipedrive Partner.',
  path: '/website-design/',
});

const PILLARS = [
  {
    title: '48-hour turnaround',
    body:
      'A working company website live in two business days from brief approval and content received. No three-month build cycles, no agency runaround.',
  },
  {
    title: 'SEO-optimised by default',
    body:
      'Technical SEO baked in — clean URLs, structured data, fast loads, sitemap, robots.txt, Open Graph tags. The same discipline we apply to our own site.',
  },
  {
    title: 'Low-cost, fixed-price',
    body:
      'One price, agreed before we start. No hourly billing surprises, no quote-on-request games. You know exactly what you are paying for what you get.',
  },
];

const INCLUDED = [
  {
    title: 'Company profile pages',
    body:
      'Home, About, Services, Contact, and any additional pages you need — written, designed and built around what your visitors are actually looking for.',
  },
  {
    title: 'Contact form',
    body:
      'A working contact form wired to your inbox, with spam protection and basic attribution capture so you know where leads came from.',
  },
  {
    title: 'Blog scaffold',
    body:
      'A blog section ready for content — clean reading experience, social-share metadata, RSS feed. You can publish posts yourself or we can ship the first few with you.',
  },
  {
    title: 'Technical SEO setup',
    body:
      'Sitemap, robots.txt, canonical URLs, structured data (Organization + LocalBusiness where relevant), Open Graph and Twitter card tags — everything Google and social platforms expect.',
  },
  {
    title: 'Analytics and tracking',
    body:
      'Google Analytics 4 and Google Search Console configured. Optional Leadfeeder or Outfunnel installation for visitor identification if you already use them.',
  },
  {
    title: 'Hosting and deployment',
    body:
      'Deployed on a modern hosting platform (Vercel by default) with HTTPS, a global CDN and automatic SSL renewal. You own the code and the domain.',
  },
];

const PROCESS = [
  {
    step: '1',
    title: 'Brief',
    body:
      'A short kickoff call (30 minutes) to understand your business, the audience you want to reach and the pages you need. We send a written brief back for sign-off.',
  },
  {
    step: '2',
    title: 'Content',
    body:
      'You send us logos, photos, existing copy and any brand guidelines. If you do not have copy, we will draft it from the kickoff call and a short follow-up — no professional copywriter required to start.',
  },
  {
    step: '3',
    title: 'Build',
    body:
      'We build the site against a preview URL you can review live. Two rounds of revisions are included. The 48 hours clock starts when content lands and the brief is approved.',
  },
  {
    step: '4',
    title: 'Launch',
    body:
      'We point your domain at the new site, set up SSL, submit the sitemap to Google Search Console, and hand over editing access. You own everything from day one.',
  },
];

const FAQS = [
  {
    q: 'Is 48 hours really realistic for a company website?',
    a: 'Yes, with one condition: the 48 hours starts when the brief is approved and your content (logos, photos, copy or copy notes) is in our hands. From that point, two business days to a live, SEO-ready company site is normal for us. If you are still deciding what to say or who you are talking to, that is the part that takes time — not the build.',
  },
  {
    q: 'What is not included at the base price?',
    a: 'E-commerce checkout, multi-language sites, custom web applications, complex CMS workflows, paid integrations with third-party platforms beyond analytics, and bespoke design systems. We will tell you up front if your request needs an upgrade and quote it transparently.',
  },
  {
    q: 'Who owns the site and the domain?',
    a: 'You do. We deploy on a hosting platform in your account (or ours, with your consent) and you own the code, content and domain. There is no lock-in. If you ever want to move the site to a different host, you can — we will hand over everything you need.',
  },
  {
    q: 'Is SEO really included or is it an upgrade?',
    a: 'Technical SEO is included — sitemap, robots, structured data, fast loading, mobile-first responsive design, semantic HTML, Open Graph tags, canonical URLs. Ongoing SEO work (keyword research, content production, backlink building) is a separate engagement — but the technical foundation is in place from day one.',
  },
  {
    q: 'How do I edit the site after it is live?',
    a: 'We offer two options. The default is a content-as-code approach where edits are made via a simple admin dashboard or by sending us small change requests inside an included support window. For teams that want to publish a lot of blog content themselves, we can ship the site on a headless CMS for a small upgrade.',
  },
];

export default function Page() {
  return (
    <>
      <StructuredData data={faqSchema(FAQS)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/pipedrive-zapier-active-campaign-services/' },
          { name: 'Website Design', path: '/website-design/' },
        ])}
      />

      <PageHero
        eyebrow="Website design"
        heading="Company websites built in 48 hours."
        lead="Fast, affordable, SEO-optimised company websites — built by the same team that runs sales systems for a Pipedrive Partner."
        primaryCta={{ href: '/contact-2/', label: 'Get a quote →' }}
        secondaryCta={{ href: '/projects/', label: 'See recent work' }}
      />

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Why teams choose us for their site</span>
          <h2>Fast. SEO-ready. No surprises on the invoice.</h2>
          <div className="as-grid-3" style={{ marginTop: 40 }}>
            {PILLARS.map((p) => (
              <article key={p.title} className="as-card">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">What you get</span>
          <h2>What is included as standard.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {INCLUDED.map((item) => (
              <article key={item.title} className="as-card">
                <h3>{item.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: item.body }} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">How it works</span>
          <h2>Four steps. Two business days from green light to live.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {PROCESS.map((p) => (
              <article key={p.step} className="as-card">
                <div className="as-icon" style={{ fontSize: 20 }}>{p.step}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why us</span>
            <h2>The same SEO discipline we apply to sales systems.</h2>
          </div>
          <div>
            <p>
              We are a Global Pipedrive Partner. Most of our work is sales systems — CRM,
              automation and AI. That gives us a perspective most web agencies do not have: a website
              is the start of a sales funnel, not a brochure. Every page on the site you build should
              push the visitor one step closer to a measurable next action.
            </p>
            <p style={{ marginTop: 16 }}>
              The same SEO discipline we use on this very site — structured data, fast static
              rendering, clean URL design, canonical tags, sitemap hygiene — is what we ship on every
              client site by default. No upsell required.
            </p>
            <p style={{ marginTop: 16 }}>
              Once your site is live and capturing leads, we can integrate it directly with your{' '}
              <Link href="/pipedrive-consultant/">Pipedrive CRM</Link>, layer in{' '}
              <Link href="/ai-consultants/">AI services</Link>, or wire it into the rest of your{' '}
              <Link href="/pipedrive-zapier-active-campaign-services/">sales and marketing stack</Link>.
              The website becomes part of a working system, not a static artefact.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Website design — common questions.</h2>
          <div style={{ marginTop: 32, display: 'grid', gap: 16 }}>
            {FAQS.map((f) => (
              <details key={f.q} className="as-card" style={{ padding: '20px 24px' }}>
                <summary style={{ fontWeight: 900, fontSize: 18, cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ marginTop: 12 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBox
        heading="Get a quote in 24 hours."
        body="Tell us about your business, the pages you need and any deadlines. We will come back with a fixed-price quote within one working day."
        primary={{ href: '/contact-2/', label: 'Request a quote →' }}
        secondary={{ href: '/pipedrive-zapier-active-campaign-services/', label: 'See all services' }}
      />
    </>
  );
}
