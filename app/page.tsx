import Link from 'next/link';
import Image from 'next/image';
import { buildMetadata } from '@/lib/seo';
import ClientLogos, { TECH_LOGOS } from '@/components/ClientLogos';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';
import { TESTIMONIALS } from '@/lib/testimonials';

export const metadata = buildMetadata({
  title: 'Pipedrive Consultants & Automation Experts | Automated Sales',
  description:
    'Leading Pipedrive Consultants. We help structure Pipedrive and automate your sales processes — CRM, AI, Zapier and ActiveCampaign experts.',
  path: '/',
  titleAbsolute: true,
});

const SERVICES = [
  {
    icon: '◆',
    title: 'Marketing and Sales Funnel Development',
    body:
      "Although we specialise in Active Campaign and Pipedrive CRM, we're more than implementation experts. We bring our wealth of experience, including Marketing and Sales Directors and Sales Founders to each project. This enables us to develop processes which work from a marketing and sales perspective, whilst also considering implementation possibilities. If you're looking for a Pipedrive Consultant our team of experts are ready to help.",
  },
  {
    icon: '⟲',
    title: 'Sales Process',
    body:
      'We work with organisations to structure end to end sales processes, designed to enable teams to hit ambitious objectives. We do this by understanding your current business, where you are today, and where you want to be. We map logical workflows which enable your team to hit and exceed their targets. Our team is comprised of award winning sales professionals at every organisational size — start-up, corporate or agency.',
  },
  {
    icon: '✦',
    title: 'Automation Experts',
    body:
      "As our name suggests, we're huge advocates for automation. We've integrated and automated countless systems and processes, using Active Campaign Automations, Pipedrive Workflows or third party platforms such as Zapier. Integrating multiple third-party applications greatly enhances functionality. By developing automations to handle repetitive tasks we save your team hours every week.",
  },
  {
    icon: '◑',
    title: 'Pipedrive, Zapier and Active Campaign Consultancy',
    body:
      "Every week, we work with multiple organisations, with many instances of Pipedrive and Active Campaign. This gives our team huge insight into best practice across different sectors. It's likely we've developed, or worked with, businesses in your sector. We can bring this expertise to your organisation.",
  },
];

const PROJECTS = [
  {
       href: '/leadrouter-case-study/',
    title: 'Building LeadRouter — Pipedrive lead routing SaaS',
    body: 'After rebuilding the same Pipedrive lead routing logic for client after client, we built it once — properly — as a standalone SaaS product with performance weighting, deal continuity, and multi-team support.',
    image: '/images/projects/leadrouter.png',
  },
  {
    href: '/taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive/',
    title: 'Pipedrive Pipeline',
    body: 'Taking an offline lead management process online for a US non-profit.',
    image: '/images/projects/pipeline.jpeg',
  },
  {
    href: '/pipedrive-activity-report/',
    title: 'Pipedrive Activity Report Tool',
    body: 'We replaced a client\'s weekly manual spreadsheet routine with a hosted web app that pulls live data from Pipedrive and automatically emails the report every Friday.',
    image: '/images/projects/pipedrive-activity-report.png',
  },
];



export default function HomePage() {
  return (
    <>
      <section className="as-hero">
        <div className="as-container as-hero-grid">
          <div>
            <span className="as-eyebrow">Marketing, Sales and Automation Consultancy</span>
            <h1>Automated Sales</h1>
            <p className="as-lead">
              Our Pipedrive Consultants develop marketing automation, sales systems, business processes and
              integrations which improve efficiency and drive profit.
            </p>
            <div className="as-actions">
              <Link className="as-btn as-btn-primary" href="/contact-2/">
                Find out more →
              </Link>
              <Link className="as-btn as-btn-secondary" href="/projects/">
                View recent projects
              </Link>
            </div>
            <div className="as-proof-list">
              <div className="as-proof-item">Pipedrive Advisory Council member</div>
              <div className="as-proof-item">Global Pipedrive Partner</div>
              <div className="as-proof-item">200+ Pipedrive projects delivered</div>
              <div className="as-proof-item">CRM, automation, AI and reporting expertise</div>
            </div>
          </div>
          <div className="as-visual">
            <div className="as-visual-dark">
              <div className="as-visual-head">
                <div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14 }}>Sales system snapshot</p>
                  <div className="as-visual-title">What gets fixed</div>
                </div>
                <div className="as-icon" style={{ background: 'rgba(255,255,255,.1)', margin: 0 }}>↗</div>
              </div>
              <Link href="/pipedrive-consultant/" className="as-visual-card"><strong>Pipeline clarity</strong><span>Stages, rules and required data</span></Link>
              <Link href="/zapier-consultants/" className="as-visual-card"><strong>Lead response</strong><span>Routing, assignment and SLA follow-up</span></Link>
              <Link href="/pipedrive-expert/" className="as-visual-card"><strong>Reporting</strong><span>Dashboards leadership can trust</span></Link>
              <Link href="/pipedrive-automation/" className="as-visual-card"><strong>Automation</strong><span>Less admin and fewer missed steps</span></Link>
            </div>
          </div>
        </div>
      </section>

      <ClientLogos heading="Some of our amazing clients" />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Get to know us</span>
            <h2>The leading marketing and sales automation consultancy.</h2>
          </div>
          <div>
            <p>
              As the leading marketing and sales automation consultancy we develop marketing funnels, sales
              workflows and business automations that save time whilst maximising profit. We understand the
              pressures facing sales professionals today and make it our priority to deliver processes and
              systems which achieve and exceed your targets. We work with businesses of all sizes, from all
              over the globe.
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
          <h2>Everything you need to run a modern sales system.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {SERVICES.map((s) => (
              <article key={s.title} className="as-card">
                <div className="as-icon">{s.icon}</div>
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

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Recent projects</span>
          <h2>A sample of recent work.</h2>
          <div className="as-grid-3" style={{ marginTop: 40 }}>
            {PROJECTS.map((p) => (
              <article key={p.href} className="as-card">
                <Link href={p.href} className="as-card-image">
                  <Image src={p.image} alt={p.title} width={1000} height={750} sizes="(max-width:700px) 100vw, 400px" />
                </Link>
                <span className="as-tag">Case study</span>
                <h3><Link href={p.href}>{p.title}</Link></h3>
                <p>{p.body}</p>
                <p style={{ marginTop: 16 }}>
                  <Link className="as-btn as-btn-secondary" href={p.href}>Read more →</Link>
                </p>
              </article>
            ))}
          </div>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            <Link className="as-btn as-btn-secondary" href="/projects/">View more →</Link>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Testimonials</span>
          <h2>What clients say.</h2>
        </div>
        <TestimonialsMarquee testimonials={TESTIMONIALS} />
        <div className="as-container">
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            <Link className="as-btn as-btn-secondary" href="/testimonials/">More testimonials →</Link>
          </div>
        </div>
      </section>

      <section className="as-cta">
        <div className="as-container">
          <div className="as-cta-box">
            <span className="as-eyebrow dark">Ready when you are</span>
            <h2>Get a sales system that works as hard as you do.</h2>
            <p>
              Book a 30-minute CRM audit. We will look at your your sales process, Pipedrive (or current CRM)
              and your tooling, and tell you how we can help.
            </p>
            <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
              <Link className="as-btn as-btn-primary" href="/contact-2/">Book a CRM audit →</Link>
              <Link className="as-btn as-btn-secondary" href="/projects/">See recent projects</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
