import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import { DEFAULT_ITEMS as PROOF_ITEMS } from '@/components/ProofList';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Automation — Workflows That Sell For You',
  description:
    'Pipedrive automation services. Workflow automation, lead routing, follow-up sequences and CRM hygiene that runs while your team focuses on selling.',
  path: '/pipedrive-automation/',
});

const FAQS = [
  {
    q: 'What can be automated in Pipedrive?',
    a: 'Lead capture and routing, deal creation from forms, next-activity creation, stage-change actions, follow-up email sequences, stale-deal alerts, lost-deal handling, ownership reassignment, data hygiene, manager notifications, integration with downstream tools — most of the recurring clicks your team does today can be automated. We focus on the automations with the highest payoff per hour of build time.',
  },
  {
    q: 'Should automation be built in Pipedrive natively or in Zapier?',
    a: 'Native Pipedrive automation is cheaper and easier to maintain — use it for anything that lives entirely inside Pipedrive. Zapier and Make are the right answer when the automation touches an external tool. We will recommend the right venue per workflow rather than pushing everything through one tool.',
  },
  {
    q: 'How do you make sure automations do not run amok?',
    a: 'Every automation we build is tested in a sandbox, has explicit guardrails (rate limits, exit conditions, idempotency where it matters), and is documented so your admins can adjust it without re-engaging us. We avoid the most common failure mode: automations that fire on every record change because no-one set the right trigger condition.',
  },
  {
    q: 'How quickly does automation pay for itself?',
    a: 'For most teams the payback is measured in weeks, not months. Saving each rep one hour a day across a five-person sales team is twenty-five hours a week of recovered selling time. Automations rarely cost what that time is worth.',
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
          { name: 'Pipedrive Automation', path: '/pipedrive-automation/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Automation"
        heading="Workflow automation that sells while your team sells."
        lead="Lead routing, follow-up sequences, stage-change actions and CRM hygiene — automated cleanly inside Pipedrive (with Zapier and Make where it makes sense)."
        primaryCta={{ href: '/contact-2/', label: 'Automate Pipedrive →' }}
        secondaryCta={{ href: '/pipedrive-integration/', label: 'See integrations' }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">The right thing to automate</span>
            <h2>Not "everything." The right things.</h2>
          </div>
          <div>
            <p>
              The temptation when you discover Pipedrive automation is to automate everything. Do not.
              Automate the work that is repetitive, low-judgement, and well-defined — and leave the
              parts of selling that involve judgement to humans. The best Pipedrive automations make
              your reps faster at the things only they can do. They do not try to replace selling.
            </p>
            <p style={{ marginTop: 16 }}>
              In practice that means automating the admin around a sale — capture, routing, follow-up
              creation, hygiene, escalation, handover — not the conversations. A rep who is spending
              two hours a day on admin and six hours selling can become a rep spending thirty minutes
              on admin and seven-and-a-half hours selling. That is what good automation buys you.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Automation patterns we build</span>
          <h2>The workflows that pay off fastest.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Lead capture &amp; routing</h3>
              <p>
                Forms, ads and lead-source integrations create a deal automatically against the right
                owner, with source attribution preserved and a first-touch activity scheduled — no rep
                ever has to type a new lead in manually.
              </p>
            </article>
            <article className="as-card">
              <h3>Next-activity automation</h3>
              <p>
                Every stage change creates the right follow-up activity for the rep, with a sensible
                default due date. Reps stop forgetting to schedule the next step. Managers stop
                chasing reps to log the next step.
              </p>
            </article>
            <article className="as-card">
              <h3>Follow-up sequences</h3>
              <p>
                Conditional email sequences triggered from deal stage or activity outcomes — running
                inside Pipedrive natively or in an integrated marketing-automation tool, depending on
                what the sequence needs to do.
              </p>
            </article>
            <article className="as-card">
              <h3>Stale-deal alerts</h3>
              <p>
                Rotting rules per stage, with manager notifications when a deal has gone too long
                without movement. Surfaces the deals worth saving and the deals worth losing fast.
              </p>
            </article>
            <article className="as-card">
              <h3>Lost-deal handling</h3>
              <p>
                Automated re-engagement on lost deals after a defined cool-off, structured lost-reason
                capture for reporting, and clean archival so dead deals do not pollute live reporting.
              </p>
            </article>
            <article className="as-card">
              <h3>CRM hygiene</h3>
              <p>
                Required-field enforcement, automatic deduplication, stale-record archival, ownership
                reassignment on departures — the boring work that keeps Pipedrive trustworthy as the
                team grows.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">How an automation engagement works</span>
            <h2>Audit, prioritise, build, document.</h2>
          </div>
          <div>
            <p>
              We start with an audit — your sales process, your current Pipedrive setup, your team's
              biggest time sinks. Out of that we produce a prioritised automation backlog with the
              expected payoff per workflow. You decide what to build first; we build it in a sandbox,
              test it against real data, ship it, and document it.
            </p>
            <p style={{ marginTop: 16 }}>
              Smaller pieces of automation work can run as standalone projects. Larger transformations
              usually pair automation with a fresh{' '}
              <Link href="/pipedrive-implementation/">Pipedrive implementation</Link> or a senior{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> engagement. For tools
              that live outside Pipedrive itself, see{' '}
              <Link href="/pipedrive-integration/">Pipedrive integration</Link>.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings pipeline',
            body: 'End-to-end Pipedrive automation for a fast-growing Canadian lettings agency — saving them an entire FTE.',
            image: '/images/projects/lettings-agent.png',
          },
          {
            slug: 'automating-sales-outreach',
            title: 'Automated sales outreach',
            body: 'Built a repeatable outbound outreach workflow inside Pipedrive plus tooling around it.',
            image: '/images/projects/outreach.png',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive automation — common questions.</h2>
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

      <RelatedPipedriveServices currentPath="/pipedrive-automation/" />

      <CtaBox
        heading="Give your reps their afternoons back."
        body="Tell us where your team is losing time in Pipedrive. We will come back with the three automations that would buy back the most hours."
        primary={{ href: '/contact-2/', label: 'Plan your automations →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'Pipedrive Consultant overview' }}
      />
    </>
  );
}
