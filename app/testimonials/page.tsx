import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';
import { TESTIMONIALS } from '@/lib/testimonials';

export const metadata = buildMetadata({
  title: 'Testimonials — Pipedrive Consultant',
  description:
    'What clients say about working with Automated Sales on Pipedrive, Zapier and Active Campaign projects.',
  path: '/testimonials/',
});



export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Are we any good?"
        heading="Here's what our clients say."
        lead="We work tirelessly to ensure the success of our partners. We look to foster long term relationships and work together both now and in the future. Here's what some of our fantastic clients had to say."
      />
      <section className="as-section">
        <div className="as-container">
          <div className="as-grid-2">
            {TESTIMONIALS.map((t, i) => (
              <article key={i} className="as-card">
                <div className="as-stars">★★★★★</div>
                <p style={{ marginTop: 12 }}>{t.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBox
        heading="Don't be shy, say hello."
        body="Tell us about your project and we'll work with you to understand your business and how we can help."
        primary={{ href: '/contact-2/', label: 'Contact us →' }}
      />
    </>
  );
}
