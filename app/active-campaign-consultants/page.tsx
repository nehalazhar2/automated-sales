import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import ClientLogos, { TECH_LOGOS } from '@/components/ClientLogos';
import RecentProjects from '@/components/RecentProjects';
import RelatedServices from '@/components/RelatedServices';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Active Campaign Consultants – Certified Active Campaign Experts',
  description:
    'Active Campaign Consultants. Marketing automation that engages prospects and drives sales. Lifecycle journeys and integrations across your stack.',
  path: '/active-campaign-consultants/',
});

const SERVICES = [
  {
    title: 'Marketing Strategy',
    body:
      "We work with businesses to understand their existing value proposition, market position and current strategies. If these aren't yet defined we can help develop these to set foundations for future growth. We've worked with hundreds of organisations across multiple sectors. We bring this experience to your business, ensuring any implementation facilitates your marketing, sales and organisational strategy.",
  },
  {
    title: 'Customer Experience Automation',
    body:
      'Our Active Campaign Consultants design and implement automated workflows that engage prospects and customers. Personalised engagement at scale allows you to increase outreach whilst providing relevant content to prospects. This relevant, targeted content increases engagement and action, ultimately resulting in increased sales and improved customer satisfaction.',
  },
  {
    title: 'Integration Experts',
    body:
      "Active Campaign is an incredibly powerful marketing automation platform, including features such as automated email journeys, site tracking, engagement, segmentation, automation and CRM. However, many of our partners use, and love, other third party platforms that specialise in particular functionality. In these instances we can integrate Active Campaign with third party platforms, allowing each to play to its strengths.",
  },
  {
    title: 'Workflow Ninjas',
    body:
      'Our team of Active Campaign consultants can map your entire customer journey, from initial awareness building, through to first contact, prospect nurturing, closed deal and ongoing customer success. Mapping the entire journey allows us to identify areas of weakness, whilst highlighting opportunities to improve.',
  },
];

const FAQS = [
  {
    q: 'Do I need an Active Campaign Consultant?',
    a: "Email marketing is one of the most effective marketing tactics, when used right. Sending the right message to the right person at the right time can massively increase your marketing effectiveness. A highly skilled Active Campaign consultant can work with you to understand your business and craft marketing automations that save you time whilst increasing effectiveness and delighting prospects and customers. Consultants working with multiple organisations see what works (and what doesn't!) and can apply best practice to your campaigns.",
  },
  {
    q: 'Why should I work with an independent Active Campaign Consultancy?',
    a: 'Our Independent Active Campaign Consultants bring expertise and experience from the entire marketing and sales process. This includes initial top of funnel awareness marketing, through to sales and customer success processes post sale. Being independent means we are not tied to any specific process or tech stack and can advise on the best solutions for your specific use case including marketing automations, sales strategy, integrations and automation.',
  },
  {
    q: 'Can you integrate Active Campaign with our other software?',
    a: "Yes. We're huge fans of Zapier and use this to integrate Active Campaign with thousands of third-party platforms. Where Zapier is insufficient (or can become costly over time), we can integrate Active Campaign using Integromat or Active Campaign's APIs.",
  },
  {
    q: 'What size businesses do you work with?',
    a: 'We work with all sizes of business, from solopreneurs to multi-nationals. No matter the size of your organisation we can improve your processes and increase sales.',
  },
  {
    q: 'How can you help me?',
    a: "We don't 'just' implement Active Campaign according to best practice. We work with our partners to understand their business, marketing and sales processes, before implementing software. This results in teams saving hours of administrative work each week whilst increasing sales performance across the business.",
  },
];

const TESTIMONIALS = [
  { quote: 'Pipedrive Consultants did a super job for us! They helped us think through our current manual lead management system and then took over from there. The milestones were all hit on time and on budget.', who: 'Carlo Franzblau, Electronic Learning Products Inc' },
  { quote: 'Pipedrive Consultants were extremely knowledgable and set-up the CRM without any problems. They were quick to respond to any queries and went out of their way to make sure the project was completed successfully.', who: 'Adam Fox, Insperanto' },
  { quote: 'Automated Sales are absolute lifesavers! They\'ve made the experience with Pipedrive so much better. They go above and beyond and are great to also brainstorm ideas with the business.', who: 'Christian, Portfolio Insider' },
];

export default function Page() {
  return (
    <>
      <StructuredData data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="Active Campaign Consultants"
        heading="Active Campaign Consultancy."
        lead="Marketing automation that engages prospects and drives sales."
        primaryCta={{ href: '/contact-2/', label: 'Find out more →' }}
        secondaryCta={{
          href: 'https://www.activecampaign.com/?_r=Q9413H3D',
          label: 'Get a free Active Campaign trial',
          sponsored: true,
        }}
      />

      <ClientLogos heading="Some of our amazing clients" />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Get to know us</span>
            <h2>Marketing automation that engages customers and drives sales.</h2>
          </div>
          <div>
            <p>
              Our team of Active Campaign experts are committed to develop marketing automation that engages
              customers and drives sales. As an agency specialising in Active Campaign we bring broad and deep
              knowledge of this platform to every project. If you&apos;re looking for an Active Campaign
              Consultant, you&apos;ve come to the right place.
            </p>
            <p style={{ marginTop: 16 }}>
              Whether you&apos;re a sole trader or multi-national, we&apos;ve the marketing experience, sales
              expertise and technology to develop marketing and customer engagement processes which save you
              time, whilst increasing revenue and profit.
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
          <h2>What our Active Campaign consultants do.</h2>
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
            slug: 'building-email-journeys-using-active-campaign',
            title: 'Lifecycle email journeys',
            body: 'Onboarding, activation, nurture and renewal journeys in ActiveCampaign — synced to Pipedrive so sales and marketing report on the same numbers.',
            image: '/images/projects/data-import.jpeg',
          },
          {
            slug: 'automating-sales-outreach',
            title: 'Multi-channel outreach',
            body: 'ActiveCampaign sequences powering a multi-channel outreach machine, with guardrails so contacts never get two competing messages.',
            image: '/images/projects/outreach.png',
          },
          {
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings communications',
            body: 'Email automations for qualification, viewing reminders and follow-up — integrated with Pipedrive and the rest of the lettings stack.',
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
          <h2>Active Campaign — common questions.</h2>
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

      <RelatedServices currentPath="/active-campaign-consultants/" />

      <CtaBox
        heading="Ready to scale your marketing operation?"
        body="Tell us about your stack and your customer journey. We will tell you where Active Campaign is earning its keep and where it is not."
        primary={{ href: '/contact-2/', label: 'Book a marketing audit →' }}
      />
    </>
  );
}
