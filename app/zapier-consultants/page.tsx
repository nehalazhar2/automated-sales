import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import ClientLogos, { TECH_LOGOS } from '@/components/ClientLogos';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Zapier Consultant - Certified Zapier Expert | Automated Sales',
  description:
    'Zapier Consultants. The leading automation consultancy. We automate time consuming tasks saving your team hours every week.',
  path: '/zapier-consultants/',
});

const SERVICES = [
  {
    title: 'Business Process Strategy',
    body:
      'We help organisations of all sizes improve their business process workflow. We review your existing processes and use Zapier to connect your favourite apps and services, developing Zaps, pathways, conditional logic and multi-step zaps. Zaps improve your business efficiency resulting in organisational growth.',
  },
  {
    title: 'Integrate Multiple Platforms',
    body:
      "We'll work with you to integrate various tools improving workflows, processes and efficiency. All processes we develop are designed specifically for your business needs. Our knowledge and experience enables us to integrate multiple platforms resulting in improved productivity.",
  },
  {
    title: 'Integration Experts',
    body:
      'Automation, integration and efficiency. Our Zapier experts create workflows specifically for your business needs. We can enable functionality, triggers and pathways which are not possible without automation tools. Through integration, automated actions are created allowing your focus on other organisational needs.',
  },
  {
    title: 'Workflow Experts',
    body:
      'We can map your entire workflow using visual tools, enabling us to identify any bottlenecks and opportunities for improvements. By developing automations to handle repetitive tasks we save your team hours every week.',
  },
];

const TESTIMONIALS = [
  { quote: "The team did a super job for us! We knew we needed an automated solution for handling incoming leads and we had picked Pipedrive as our platform, but that's about all we knew. They helped us think through our current manual lead management system and then took over from there. The milestones were all hit on time and on budget.", who: 'Carlo Franzblau, Electronic Learning Products Inc' },
  { quote: 'They were extremely knowledgable and set-up the CRM without any problems. They were quick to respond to any queries and went out of their way to make sure the project was completed successfully.', who: 'Adam Fox, Insperanto' },
  { quote: 'Another great project from the team. Thank you for all your help with this. Dan comes highly recommended and we will be continuing to work with him on an hourly contract.', who: 'Kirsty Griffiths, Glow' },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Zapier Consultants"
        heading="The leading automation consultancy, specialising in Zapier."
        lead="Zapier Automations connecting your favourite services and apps. We automate time consuming tasks saving your team hours every week."
        primaryCta={{ href: '/contact-2/', label: 'Find out more →' }}
        secondaryCta={{ href: '/pipedrive-zapier-active-campaign-services/', label: 'Explore services' }}
      />

      <ClientLogos heading="Some of our amazing clients" />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Get to know us</span>
            <h2>Automated workflows that save hours every week.</h2>
          </div>
          <div>
            <p>
              As the leading Zapier consultancy, we craft automated workflows that save hours every week,
              allowing you to work smarter, not harder. Whether you manage a large corporation, are a freelancer
              or start-up; our expertise is tailored to your specific requirements.
            </p>
            <p style={{ marginTop: 16 }}>
              We have the experience and technology to improve your existing processes whilst integrating with
              systems previously not possible. We love technology, processes and people, more than anything we
              love to help. We do this by firstly understanding your business, and where improvements can be
              made. The result? Integrations and automations that improve both efficiency and results.
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
          <h2>What our Zapier consultants do.</h2>
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

      <CtaBox
        heading="Got Zaps you do not trust anymore?"
        body="Send us a screenshot of your Zapier dashboard. We will tell you what to keep, what to rebuild, and what to delete."
        primary={{ href: '/contact-2/', label: 'Book an automation audit →' }}
      />
    </>
  );
}
