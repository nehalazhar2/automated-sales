import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import ClientLogos, { TECH_LOGOS } from '@/components/ClientLogos';
import RecentProjects from '@/components/RecentProjects';
import RelatedServices from '@/components/RelatedServices';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import ProofList from '@/components/ProofList';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Pipedrive Consultant – Certified Pipedrive Experts',
  description:
    'Pipedrive Consultant. Sales Strategy. Sales Ops. We create sales processes that scale and Pipedrive setups that your team actually uses.',
  path: '/pipedrive-consultant/',
});

const SERVICES = [
  {
    title: 'Pipedrive Pipeline Development',
    body:
      'Our Pipedrive Consultants work collaboratively with you and your team to map logical sales processes. These processes improve both efficiency and results. As an organisation specialising in sales process and Pipedrive CRM, our consultants bring vast experience to each and every project.',
  },
  {
    title: 'Sales Strategy Consulting',
    body:
      "If you're looking for a Pipedrive consultant, you've come to the right place. We partner with businesses of all sizes to understand their current sales strategies and processes. We review current performance, identify areas of improvement and develop actionable plans your organisation can achieve. Our team includes Sales Directors, Start-up Founders and Marketing Managers with corporate, startup and agency experience.",
  },
  {
    title: 'Pipedrive Integration Experts',
    body:
      "We've integrated Pipedrive with countless third party platforms, often creating solutions our clients thought impossible. These integrations have saved our partners hundreds of hours of admin time whilst improving overall performance. Connecting multiple, siloed systems reduces risk of human error whilst allowing you to scale your sales output disproportionately to the size of your team.",
  },
  {
    title: 'Pipedrive Workflow Ninjas',
    body:
      'Our team can map your entire sales journey, from the very first contact through to closed deal and beyond. Mapping the process allows us to identify areas of weakness, whilst highlighting opportunities to improve. This is often the first step to improving your sales performance.',
  },
];

const FAQS = [
  {
    q: 'Do I need a Pipedrive Consultant?',
    a: 'We love Pipedrive for its simplicity and ease of use. Most people can setup the CRM independently, however a great Pipedrive Consultant can help you think through your sales process and bring expertise to configure the CRM to match this, resulting in a system that works for your team and your business.',
  },
  {
    q: 'Why should I work with an independent Pipedrive Consultancy?',
    a: 'Our Independent Pipedrive Consultants bring expertise and experience from the entire sales process. This includes initial top of funnel marketing, through to sales and business process post sale. Being independent means we are not tied to any specific process or tech stack and can advise on the best solutions for your specific use case including sales strategy, integrations and automation.',
  },
  {
    q: 'Can you integrate Pipedrive with our other software?',
    a: "Yes. We're huge fans of Zapier and Make (Integromat) and use these tools to integrate Pipedrive with thousands of third-party platforms. Where Zapier is insufficient (or can become costly over time), we can integrate Pipedrive directly using their APIs.",
  },
  {
    q: 'What size businesses do you work with?',
    a: 'We work with all sizes of business, from solopreneurs to multi-nationals. No matter the size of your organisation we can improve your processes and increase sales.',
  },
  {
    q: 'How can you help me?',
    a: "We don't 'just' implement Pipedrive according to best practice. We work with our partners to understand their business and sales process, offering advice and recommendations before configuring the CRM. This results in teams saving hours of administrative work each week whilst increasing sales performance across the business.",
  },
];

const TESTIMONIALS = [
  { quote: 'Pipedrive Consultants did a super job for us! They helped us think through our current manual lead management system and then took over from there. The milestones were all hit on time and on budget.', who: 'Carlo Franzblau, Electronic Learning Products Inc' },
  { quote: 'Automated Sales went above and beyond cleaning up our Pipedrive account and creating a ton of automations. Highly recommended!!!', who: 'Bryan Driscoll, Motivated Leads' },
  { quote: 'Automated Sales are the ultimate Pipedrive consultants. They implemented an amazing Pipedrive process for our sales team!', who: 'Geeshan, Netfusion Designs' },
];

export default function Page() {
  return (
    <>
      <StructuredData data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="Pipedrive Consultant"
        heading="We're the leading Pipedrive CRM consultancy."
        lead="We develop Pipedrive sales systems and processes which improve efficiency and drive profit."
        primaryCta={{ href: '/contact-2/', label: 'Find out more →' }}
        secondaryCta={{
          href: 'https://app.pipedrive.com/affiliate/pdp-automated-sales?utm_content=copy_text&utm_medium=partners_program&utm_source=Automated%20Sales&utm_term=pdp-automated-sales',
          label: 'Get an extended free Pipedrive trial',
          sponsored: true,
        }}
      />

      <ProofList />

      <ClientLogos heading="Some of our amazing clients" />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Get to know us</span>
            <h2>A team of Pipedrive experts dedicated to maximising your profit.</h2>
          </div>
          <div>
            <p>
              Our team of Pipedrive experts are dedicated to maximising your profit. As an agency specialising
              in Pipedrive we bring broad and deep knowledge of this CRM to every project. If you&apos;re looking
              for a Pipedrive Consultant, you&apos;ve come to the right place.
            </p>
            <p style={{ marginTop: 16 }}>
              Whether you&apos;re a sole trader or multi-national, we&apos;ve the sales expertise, experience and
              technology to develop CRM processes which save your team hours, whilst increasing revenue and
              profit.
            </p>
            <p style={{ marginTop: 16 }}>
              Although we work with sales and marketing technology, we&apos;re humans and understand the value of
              relationships. We work relentlessly to ensure our partners are delighted with our work and look
              to foster long term partnerships.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link className="as-btn as-btn-secondary" href="/about-2/">Learn more →</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Our Services</span>
          <h2>Four pillars of a Pipedrive engagement.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {SERVICES.map((s) => (
              <article key={s.title} className="as-card">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 40 }}>
            <Link className="as-btn as-btn-primary" href="/contact-2/">Talk to us today →</Link>
          </div>
        </div>
      </section>

      <ClientLogos heading="Technologies we integrate" logos={TECH_LOGOS} speed={30} />

      <RecentProjects
        projects={[
          {
            slug: 'increasing-sales-for-a-high-tech-high-growth-startup',
            title: 'Pipedrive launch in 2 weeks',
            body: 'Full Pipedrive implementation for a Los Angeles fintech — data cleansing, dedupe, timezone formulas and a sales dashboard built against an aggressive deadline.',
            image: '/images/projects/data-import.jpeg',
          },
          {
            slug: 'taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive',
            title: 'Offline to Pipedrive',
            body: 'A US non-profit moved off spreadsheets onto Pipedrive — every awareness, qualification and tablet-shipment step automated against the right deal.',
            image: '/images/projects/pipeline.jpeg',
          },
          {
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings pipeline',
            body: 'End-to-end Pipedrive automation for a fast-growing Canadian lettings agency — saving them an entire FTE.',
            image: '/images/projects/lettings-agent.png',
          },
        ]}
      />

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Testimonials</span>
          <h2>What clients say.</h2>
          <div className="as-grid-3" style={{ marginTop: 40 }}>
            {TESTIMONIALS.map((t) => (
              <article key={t.who} className="as-card">
                <div className="as-stars">★★★★★</div>
                <p style={{ marginTop: 12 }}>{t.quote}</p>
                <p style={{ marginTop: 16, fontWeight: 800, color: 'var(--slate-700)' }}>{t.who}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ&apos;s</span>
          <h2>Pipedrive consultant — common questions.</h2>
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

      <RelatedPipedriveServices
        currentPath="/pipedrive-consultant/"
        heading="Specialised Pipedrive services."
      />

      <RelatedServices currentPath="/pipedrive-consultant/" />

      <CtaBox
        heading="Ready to scale your sales operation?"
        body="Tell us about your Pipedrive (or current CRM), your sales process and your tooling. We will tell you what to fix first."
        primary={{ href: '/contact-2/', label: 'Book a CRM audit →' }}
        secondary={{ href: '/pipedrive-zapier-active-campaign-services/', label: 'See all services' }}
      />
    </>
  );
}
