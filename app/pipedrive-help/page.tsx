import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import ProofList from '@/components/ProofList';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Help — Ad-Hoc Pipedrive Support',
  description:
    'Pipedrive help when something specific is broken. Ad-hoc support from senior Pipedrive consultants — fix a workflow, clean a pipeline, unblock a sync.',
  path: '/pipedrive-help/',
});

const FAQS = [
  {
    q: 'How quickly can you start on a Pipedrive help request?',
    a: 'We usually start within two to five business days. Urgent issues (broken automation, failed integration, deal data loss) get a same-day or next-day call. Tell us the urgency on the contact form and we will respond accordingly.',
  },
  {
    q: 'How does ad-hoc Pipedrive help work?',
    a: 'You describe the problem, we scope a small block of work (typically one to ten hours), we quote it, you approve, we fix it. No long contracts, no minimum spend, no obligation to engage further. Most help requests close inside a week.',
  },
  {
    q: 'What kinds of problems do you typically fix?',
    a: 'Broken automations, mis-configured workflows, integration syncs that have stopped working, dashboards that have stopped reflecting reality, deduplication, custom-field re-architecture, permissions mistakes, deal-stage drift and reporting failures. If it is in Pipedrive and it is broken, we have probably fixed it before.',
  },
  {
    q: 'Will you train us so we do not need help again?',
    a: 'Yes. As part of any help engagement we explain what went wrong, why, and how to spot it earlier next time. If you want structured upskilling for the whole team, our Pipedrive training service is a better fit.',
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
          { name: 'Pipedrive Help', path: '/pipedrive-help/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Help"
        heading="Stuck in Pipedrive? We can help."
        lead="Ad-hoc Pipedrive support from senior consultants. No retainer, no minimum spend — fix the specific thing that is broken and get on with selling."
        primaryCta={{ href: '/contact-2/', label: 'Describe your problem →' }}
        secondaryCta={{ href: '/pipedrive-training/', label: 'Need training instead?' }}
      />

      <ProofList />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">What "help" means here</span>
            <h2>Small, scoped, surgical.</h2>
          </div>
          <div>
            <p>
              Pipedrive help is a deliberately narrow service. Something specific is broken, or
              something specific needs building, and you want a senior consultant to fix it without the
              overhead of a full implementation engagement. We scope the request, quote it, fix it, and
              hand back. Most requests resolve in under ten hours of work.
            </p>
            <p style={{ marginTop: 16 }}>
              If you find yourself raising five "help" requests in a quarter, you do not need help —
              you need an{' '}
              <Link href="/pipedrive-consultant/">ongoing Pipedrive Consultant</Link> relationship, and
              we will tell you that rather than churning small invoices.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Common help requests</span>
          <h2>The things teams ask us to fix.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Broken automation workflows</h3>
              <p>
                An automation that used to fire and now does not, or that fires twice, or that triggers
                on the wrong field change. Almost always a logic or condition issue layered on top of a
                Pipedrive UI change — we will find it and fix it.
              </p>
            </article>
            <article className="as-card">
              <h3>Failed integrations &amp; syncs</h3>
              <p>
                Zapier zaps that have errored silently. Native integrations that have lost their auth.
                Two-way syncs that have drifted out of agreement. We triage the failure, replay the
                missing records, and harden the integration so it does not fail the same way again.
              </p>
            </article>
            <article className="as-card">
              <h3>Pipeline &amp; data hygiene</h3>
              <p>
                Duplicates, dead deals, mis-stage'd opportunities, custom fields that everyone fills
                in differently. We will dedupe, archive, and put guardrails in place — required fields,
                automation, validation — so it stays clean.
              </p>
            </article>
            <article className="as-card">
              <h3>Reporting that lies</h3>
              <p>
                Dashboards that show numbers your team does not trust. Usually a field is being used
                inconsistently, a deal is excluded from the wrong filter, or a stage is double-counted.
                We audit the report, fix the data model, and rebuild the dashboard on a stable basis.
              </p>
            </article>
            <article className="as-card">
              <h3>Permissions &amp; visibility</h3>
              <p>
                A rep can see deals they should not, or cannot see deals they should. We audit your
                permission set, simplify it, and document who can see what — so the next reorganisation
                does not require a Pipedrive rebuild.
              </p>
            </article>
            <article className="as-card">
              <h3>Quick-turn add-ons</h3>
              <p>
                One new automation, one new custom field set, one new integration with a tool you have
                just adopted. We will build it cleanly inside your existing setup — not bolt it on the
                side.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">How a help engagement runs</span>
            <h2>From "stuck" to "fixed" in a week.</h2>
          </div>
          <div>
            <p>
              You describe the problem. We jump on a 30-minute call to see your Pipedrive instance and
              confirm we understand it. We quote the work — typically a single block of hours, fixed
              price. You approve in writing. We fix it, document what we changed, and hand back. Where
              relevant we walk you through what we did so your team can maintain it.
            </p>
            <p style={{ marginTop: 16 }}>
              If the fix uncovers something larger, we tell you immediately rather than quietly scope-
              creep. You decide whether to expand the engagement or to fix only what was originally
              agreed. For larger work consider{' '}
              <Link href="/pipedrive-implementation/">Pipedrive implementation</Link> or our{' '}
              <Link href="/pipedrive-automation/">automation</Link> service instead.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'building-email-journeys-using-active-campaign',
            title: 'Lifecycle email journey rebuild',
            body: 'Rescued a broken ActiveCampaign and Pipedrive integration — restored sync, deduped contacts and rebuilt the welcome journey.',
            image: '/images/projects/outreach.png',
          },
          {
            slug: 'automating-sales-outreach',
            title: 'Outreach unstuck',
            body: 'Fixed a multi-tool outreach setup whose automations had drifted out of alignment with the actual sales process.',
            image: '/images/projects/outreach.png',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive help — common questions.</h2>
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

      <RelatedPipedriveServices currentPath="/pipedrive-help/" />

      <CtaBox
        heading="Tell us what is broken."
        body="One short message describing the problem is enough. We will tell you whether it is a quick fix, a larger project, or something you can solve yourself."
        primary={{ href: '/contact-2/', label: 'Get help with Pipedrive →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'Pipedrive Consultant overview' }}
      />
    </>
  );
}
