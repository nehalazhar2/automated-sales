import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedServices from '@/components/RelatedServices';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'AI Consultants for Sales Teams',
  description:
    'AI consultants that help sales teams adopt AI where it pays back: transcription, lead scoring, AI agents and content tooling embedded in the CRM.',
  path: '/ai-consultants/',
});

const USE_CASES = [
  { title: 'Call transcription → CRM', body: 'Every meeting transcribed, summarised and pushed back into Pipedrive against the right deal.' },
  { title: 'Lead scoring', body: 'Score against real outcomes, not gut feel — Pipedrive fields driven by an AI model your team can trust.' },
  { title: 'AI agents', body: 'Inbox triage, follow-up drafting, admin work — narrow agents that do one job well.' },
  { title: 'RAG over your CRM', body: 'Ask questions of your CRM and knowledge base in natural language with answers grounded in your data.' },
  { title: 'Voice of customer', body: 'Surface themes from calls, surveys and support tickets to feed product, sales and marketing.' },
  { title: 'Content generation', body: 'Outreach, proposals and case studies generated against your tone of voice and a vetted source-of-truth.' },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="AI consultancy"
        heading="AI that fits the sales process — not a science project."
        lead="We help sales-led teams adopt AI in ways that compound: tied to the CRM, measurable, and owned by the team — not the consultant."
        primaryCta={{ href: '/contact-2/', label: 'Book an AI workshop →' }}
        secondaryCta={{ href: '/projects/', label: 'See AI projects' }}
      />

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Where AI pays back</span>
          <h2>Six use cases we deploy most often.</h2>
          <div className="as-grid-3" style={{ marginTop: 40 }}>
            {USE_CASES.map((u) => (
              <article key={u.title} className="as-card">
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RecentProjects
        projects={[
          {
            slug: 'rw-invest-ai',
            title: 'AI inside a property investment sales team',
            body: 'Call transcription, intent scoring and AI-assisted drafting embedded into the CRM — without breaking the brand voice or compliance posture.',
          },
          {
            slug: 'safer-group-ai',
            title: 'AI in a regulated environment',
            body: 'Narrow AI agents and transcription introduced into a regulated sales process, with audit trails and a human in the loop where decisions touch a customer.',
          },
          {
            slug: 'automating-sales-outreach',
            title: 'AI-assisted outreach at scale',
            body: 'Subject-line and first-line drafting plus AI call summaries feeding Pipedrive — 3.4× outreach volume at flat headcount, brand voice intact.',
            image: '/images/projects/outreach.png',
          },
        ]}
      />

      <RelatedServices currentPath="/ai-consultants/" />

      <CtaBox
        heading="Where could AI actually help your sales team?"
        body="Tell us what your team does every day. We will tell you where AI saves hours and where it is a distraction."
        primary={{ href: '/contact-2/', label: 'Book an AI workshop →' }}
      />
    </>
  );
}
