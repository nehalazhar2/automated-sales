import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';

const PIPEDRIVE_AFFILIATE_URL =
  'https://app.pipedrive.com/affiliate/pdp-automated-sales?utm_content=copy_text&utm_medium=partners_program&utm_source=Automated%20Sales&utm_term=pdp-automated-sales';

export const metadata = buildMetadata({
  title: 'Extended Free Pipedrive Trial — Free Pipedrive Consultation',
  description:
    'Try Pipedrive free for 30 days — twice as long as the standard trial. Plus a free 30-minute consultation from a Pipedrive Partner.',
  path: '/free-pipedrive-trial-extended/',
});

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free Pipedrive trial"
        heading="Try Pipedrive free for 30 days."
        lead="Pipedrive's standard trial is 14 days. As a Global Pipedrive Partner, we can give you an extended 30-day trial — twice as long. Plus a free 30-minute consultation to help configure Pipedrive around your sales process."
        primaryCta={{
          href: PIPEDRIVE_AFFILIATE_URL,
          label: 'Start your free 30-day trial →',
          sponsored: true,
        }}
        secondaryCta={{ href: '/contact-2/', label: 'Book a consultation' }}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">About Pipedrive</span>
            <h2>The first CRM designed for salespeople, by salespeople.</h2>
          </div>
          <div>
            <p>
              Pipedrive is the first CRM designed for salespeople by salespeople. The platform emphasises
              intuitive usability and activity-focused workflows. The software serves over 100,000 users
              across 179 countries and has been recognised as a CRM leader by G2.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">About Automated Sales</span>
            <h2>A Global Pipedrive Partner.</h2>
          </div>
          <div>
            <p>
              Automated Sales is a consultancy specialising in Pipedrive implementation, sales process design
              and workflow automation. We are a Global Pipedrive Partner and a member of the Pipedrive
              Advisory Council. We have shipped 200+ CRM, automation and AI projects across SaaS, professional
              services, property, finance and B2B services.
            </p>
            <p style={{ marginTop: 16 }}>
              Whether you are just exploring Pipedrive or you already have a Pipedrive account and want it
              configured around how your team actually sells, we can help.
            </p>
          </div>
        </div>
      </section>

      <CtaBox
        heading="Ready to try Pipedrive?"
        body="Start your free 30-day extended trial, then book a free 30-minute consultation to discuss how Pipedrive can be customised for your business."
        primary={{ href: PIPEDRIVE_AFFILIATE_URL, label: 'Start your free 30-day trial →', sponsored: true }}
        secondary={{ href: '/contact-2/', label: 'Book a consultation' }}
      />
    </>
  );
}
