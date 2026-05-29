import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import { DEFAULT_ITEMS as PROOF_ITEMS } from '@/components/ProofList';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';
import { TESTIMONIALS } from '@/lib/testimonials';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Partner — Certified Global Pipedrive Partner (UK)',
  description:
    'A certified Pipedrive Partner and Pipedrive Advisory Council member in the UK — extended free trials, partner discounts and senior expertise.',
  path: '/pipedrive-partner/',
});

const FAQS = [
  {
    q: 'What does it mean to be a Pipedrive Partner?',
    a: 'Pipedrive Partners are vetted consultancies certified by Pipedrive to implement, integrate and resell the CRM. The programme has multiple tiers based on volume, customer satisfaction and product expertise. We sit in the top 30 globally and on the Pipedrive Advisory Council — meaning we shape product direction as well as deliver projects.',
  },
  {
    q: 'Do I save money by buying Pipedrive through a partner?',
    a: 'Yes — partners can offer extended free trials and partner-discounted pricing on Pipedrive licenses. More importantly, you save the cost of misconfiguring the CRM yourself. The license discount is a nice-to-have; the implementation expertise is what actually moves the numbers.',
  },
  {
    q: 'What is the Pipedrive Advisory Council?',
    a: 'A small group of senior partners that Pipedrive convenes to consult on product direction, integration roadmap and partner programme design. Council membership means our team sees Pipedrive product changes early and feeds back what we hear from clients.',
  },
  {
    q: 'Are you a UK-based Pipedrive partner?',
    a: 'Yes — we are headquartered in Cardiff, UK, and the team is UK-based. We serve clients across the UK, Europe, North America and Asia-Pacific remotely, with in-person engagements available in the UK by arrangement.',
  },
];

export default function Page() {
  return (
    <>
      <StructuredData data={faqSchema(FAQS)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pipedrive Consultant', path: '/pipedrive-consultant/' },
          { name: 'Pipedrive Partner', path: '/pipedrive-partner/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Partner"
        heading="A certified Global Pipedrive Partner — built in the UK."
        lead="Certified Pipedrive Partner and Pipedrive Advisory Council member. We help vendor-validated companies pick, configure, integrate and scale Pipedrive."
        primaryCta={{ href: '/contact-2/', label: 'Talk to the partner team →' }}
        secondaryCta={{
          href: 'https://app.pipedrive.com/affiliate/pdp-automated-sales?utm_content=copy_text&utm_medium=partners_program&utm_source=Automated%20Sales&utm_term=pdp-automated-sales',
          label: 'Get an extended free Pipedrive trial',
          sponsored: true,
        }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why partner status matters</span>
            <h2>The difference between certified and self-taught.</h2>
          </div>
          <div>
            <p>
              Anyone can call themselves a Pipedrive consultant. Pipedrive Partner status is awarded by
              Pipedrive itself, based on certified projects shipped, customer satisfaction scores, and
              ongoing engagement with the product roadmap — a useful filter when you are deciding
              whom to trust with your CRM.
            </p>
            <p style={{ marginTop: 16 }}>
              That validation is not just a logo. It means we have access to senior Pipedrive product
              and engineering contacts when an integration or configuration question genuinely needs
              an answer from the source. It means we hear about product changes early. And it means
              you can verify our standing with Pipedrive directly.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">What partnership gives you</span>
          <h2>Concrete partner benefits.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Extended free trial</h3>
              <p>
                Standard Pipedrive trials are 14 days. As a partner we can extend that to 30 days plus
                a free 30-minute consultation — twice as long to evaluate the CRM with senior advice on
                the side.{' '}
                <Link href="/free-pipedrive-trial-extended/">See trial details.</Link>
              </p>
            </article>
            <article className="as-card">
              <h3>Partner-priced licenses</h3>
              <p>
                We can offer Pipedrive license discounts on certain plans through the partner channel,
                with annual billing and Pipedrive support included exactly as direct customers receive.
              </p>
            </article>
            <article className="as-card">
              <h3>Roadmap visibility</h3>
              <p>
                Through the Advisory Council we see Pipedrive's roadmap ahead of public announcements.
                We can tell you which features to wait for and which to build around now — without
                breaching anything we have heard in confidence.
              </p>
            </article>
            <article className="as-card">
              <h3>Escalation path</h3>
              <p>
                Tricky issues that hit a wall in standard Pipedrive support can be escalated through
                partner channels. We have used this path to unblock client projects more than once.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Beyond the licence</span>
            <h2>What we do with partner expertise.</h2>
          </div>
          <div>
            <p>
              Partner status only matters if it shows up in the work. Our partner expertise turns into
              client outcomes through full{' '}
              <Link href="/pipedrive-implementation/">Pipedrive implementations</Link>,{' '}
              <Link href="/pipedrive-automation/">Pipedrive automation</Link>,{' '}
              <Link href="/pipedrive-integration/">integrations</Link>,{' '}
              <Link href="/pipedrive-training/">team training</Link>, and ongoing senior{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> relationships.
            </p>
            <p style={{ marginTop: 16 }}>
              Wherever you are in your Pipedrive journey — picking the CRM, scaling it, rescuing a
              broken setup, or pushing the limits of what it can do — partner-grade expertise lowers
              the risk and shortens the timeline.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'increasing-sales-for-a-high-tech-high-growth-startup',
            title: 'Pipedrive launch in 2 weeks',
            body: 'Full Pipedrive implementation for a Los Angeles fintech against an aggressive deadline — exactly the kind of work partner standing makes faster.',
            image: '/images/projects/data-import.jpeg',
          },
          {
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings pipeline',
            body: 'A near-fully-automated business built on Pipedrive — saving a fast-growing Canadian lettings agency an entire FTE.',
            image: '/images/projects/lettings-agent.png',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive partner — common questions.</h2>
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

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Testimonials</span>
          <h2>What clients say.</h2>
        </div>
        <TestimonialsMarquee testimonials={TESTIMONIALS} />
      </section>

      <RelatedPipedriveServices currentPath="/pipedrive-partner/" />

      <CtaBox
        heading="Buy or build Pipedrive with a certified partner."
        body="Whether you are evaluating Pipedrive for the first time or scaling an existing setup, partner-grade expertise lowers the risk."
        primary={{ href: '/contact-2/', label: 'Speak to the team →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'See the full Pipedrive Consultant service' }}
      />
    </>
  );
}
