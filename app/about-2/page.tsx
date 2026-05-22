import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'About Us',
  description:
    'About Automated Sales — the leading marketing, sales, automation and CRM consultancy specialising in Pipedrive, Active Campaign and Zapier.',
  path: '/about-2/',
});

const VALUES = [
  'We only offer our clients solutions we believe will benefit their business.',
  'We make sure our goals are aligned with our clients before agreeing work.',
  'We always aim to over-deliver.',
  'We keep our clients informed throughout their projects.',
  'We continue to learn new technologies to ensure we can always offer the best solutions.',
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="About"
        heading="The leading marketing, sales, automation and CRM consultancy specialising in Pipedrive, Active Campaign and Zapier."
        lead="We're problem solvers and solution makers — doers who believe in getting the job done, and done well."
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why Pipedrive?</span>
            <h2>Simple, customisable, and even more powerful with the right integrations.</h2>
          </div>
          <div>
            <p>
              We&apos;ve used Pipedrive for years, in freelance, startup and corporate roles. We&apos;ve watched
              the software grow from simple software to manage sales, to the fully featured platform it is
              today. We love Pipedrive for its simplicity of use, combined with customisation options. Its
              functionality can be improved even further when combined with Zapier and other third party tools.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why Zapier?</span>
            <h2>Connect thousands of apps. Automate the manual work in sales.</h2>
          </div>
          <div>
            <p>
              Zapier allows us to automate much of the manual work involved within sales, or business process.
              It allows us to connect thousands of apps and develop workflows not possible with specialist
              software independently.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why us?</span>
            <h2>Doers who believe in getting the job done, and done well.</h2>
          </div>
          <div>
            <p>
              Having experienced more CRMs than we&apos;d like to admit, we&apos;ve found Pipedrive to be the
              simplest to deploy, yet most powerful, when integrating third party systems.
            </p>
            <p style={{ marginTop: 16 }}>
              We&apos;re doers who believe in getting the job done, and done well. We work relentlessly towards
              the success of our customers and ourselves.
            </p>
            <p style={{ marginTop: 16 }}>
              We work in tech, but we&apos;re still human. We believe in creating long term relationships which
              benefit our partners and ourselves. If you&apos;re looking to improve processes, drive efficiencies
              and ultimately drive revenue — then look no further.
            </p>
            <p style={{ marginTop: 16 }}>
              We&apos;re problem solvers and solution makers. Talk to us today about your project and we&apos;ll
              work with you to understand your business and how we can help.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Values</span>
          <h2>What we hold ourselves to.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {VALUES.map((v, i) => (
              <article key={v} className="as-card">
                <div className="as-step-num">{String(i + 1).padStart(2, '0')}</div>
                <p style={{ marginTop: 18 }}>{v}</p>
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
