import PageHero from '@/components/PageHero';
import ContactForm from '@/components/ContactForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact Us | Automated Sales | Pipedrive Consultants',
  description:
    'Get in touch about Pipedrive, Active Campaign, Zapier, automation or AI workflows. We typically reply within one working day.',
  path: '/contact-2/',
});

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        heading="Lets chat."
        lead="Get in touch to find out how we can help. Tell us a few lines about your setup and what you are trying to fix — we typically reply within one working day."
      />
      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">What happens next</span>
            <h2>One reply. One short call. No sales push.</h2>
            <p>
              We will reply with a couple of clarifying questions, then book a 30-minute call to dig into the
              shape of your sales process and your current stack. If we are the right team you will get a
              clear scope, timeline and price. If we are not, we will tell you who is.
            </p>

            <div style={{ marginTop: 40, display: 'grid', gap: 16 }}>
              <div>
                <div className="as-footer-title" style={{ color: 'var(--slate-500)' }}>Email</div>
                <a href="mailto:info@automated-sales.com" style={{ fontWeight: 800 }}>info@automated-sales.com</a>
              </div>
              <div>
                <div className="as-footer-title" style={{ color: 'var(--slate-500)' }}>Based in</div>
                <p style={{ margin: 0, fontWeight: 700 }}>Cardiff, UK — working with clients worldwide</p>
              </div>
              <div>
                <div className="as-footer-title" style={{ color: 'var(--slate-500)' }}>Social</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <a href="https://www.linkedin.com/company/automated-sales/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://twitter.com/automated_sales" target="_blank" rel="noopener noreferrer">Twitter</a>
                  <a href="https://www.facebook.com/automatedsales" target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="https://www.instagram.com/automatedsales1/" target="_blank" rel="noopener noreferrer">Instagram</a>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
