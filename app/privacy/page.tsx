import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How Automated Sales collects, uses and protects information about people who visit this website or get in touch with us.',
  path: '/privacy/',
});

export default function Page() {
  return (
    <article className="as-container as-section" style={{ maxWidth: 820 }}>
      <span className="as-eyebrow">Privacy</span>
      <h1>Your privacy matters to us.</h1>
      <p className="as-lead">
        This Privacy Policy explains how Automated Sales collects, uses, shares and protects information about
        people who visit this website or get in touch with us. By using the website or any of our services you
        consent to the practices described below.
      </p>

      <h2 style={{ marginTop: 48 }}>Who this applies to</h2>
      <p>
        This policy applies to anyone, anywhere in the world, who uses this website or contacts us through it.
        The website and any related services are intended for users aged 18 or older. We do not knowingly
        collect personal information from anyone under the age of 13; if you become aware that we have done so
        in error, contact us and we will delete the data.
      </p>

      <h2 style={{ marginTop: 48 }}>What we collect</h2>
      <p>
        We collect information you provide directly to us when you submit the contact form on this website
        (name, email address, company name, the service you are interested in, and your message), and basic
        technical information that any web server records (IP address, browser type, pages viewed, referring
        site, dates and times).
      </p>

      <h2 style={{ marginTop: 48 }}>How we use it</h2>
      <ul>
        <li>To reply to your enquiry and follow up where appropriate.</li>
        <li>To keep a record of our prior correspondence with you.</li>
        <li>To analyse anonymous traffic patterns and improve the website.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>
        We do not sell personal data. We do not share your details with third parties for their own marketing
        purposes.
      </p>

      <h2 style={{ marginTop: 48 }}>Cookies and analytics</h2>
      <p>
        This site does not load third-party advertising or behavioural-tracking cookies by default. If we add
        product analytics in future, we will update this notice and surface a cookie banner where required by
        law.
      </p>

      <h2 style={{ marginTop: 48 }}>How we protect your information</h2>
      <p>
        We use commercially reasonable technical and administrative security measures, including HTTPS in
        transit and access controls on our internal systems, to reduce the risk of loss, misuse, unauthorised
        access, disclosure or alteration of your information. No system is perfectly secure; we will inform
        you promptly if a breach affecting your information occurs.
      </p>

      <h2 style={{ marginTop: 48 }}>Sharing of information</h2>
      <p>
        We may share information with trusted third-party service providers who help us operate this website
        and respond to enquiries — for example email delivery, hosting and form-handling services. These
        providers are only allowed to use the information to provide their service to us and are bound by
        confidentiality obligations.
      </p>
      <p>
        We may disclose information where required by law, court order or regulatory authority, or where we
        reasonably believe disclosure is necessary to protect the rights, property or safety of Automated
        Sales, our partners or the public.
      </p>

      <h2 style={{ marginTop: 48 }}>Your rights</h2>
      <p>
        You can ask us to access, correct or delete any personal data we hold about you by emailing{' '}
        <a href="mailto:info@automated-sales.com">info@automated-sales.com</a>. We will respond within a
        reasonable time and in accordance with applicable law. If you are in the UK or EU, you also have the
        right to lodge a complaint with the Information Commissioner&apos;s Office or your local supervisory
        authority.
      </p>

      <h2 style={{ marginTop: 48 }}>International transfers</h2>
      <p>
        We may send and store your personal information outside the country where you reside, including
        countries that may not provide the same level of protection. Where this happens we take appropriate
        steps to protect the information in accordance with this policy.
      </p>

      <h2 style={{ marginTop: 48 }}>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with a
        revised date. By continuing to use the website after a change takes effect, you accept the revised
        policy.
      </p>

      <p style={{ marginTop: 48, fontSize: 14, color: 'var(--slate-500)' }}>
        Last updated: {new Date().toISOString().slice(0, 10)}. Questions? Email{' '}
        <a href="mailto:info@automated-sales.com">info@automated-sales.com</a>.
      </p>
    </article>
  );
}
