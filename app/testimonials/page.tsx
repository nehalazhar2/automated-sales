import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Testimonials — Pipedrive Consultant',
  description:
    'What clients say about working with Automated Sales on Pipedrive, Zapier and Active Campaign projects.',
  path: '/testimonials/',
});

const TESTIMONIALS = [
  {
    quote:
      "Dan has been an amazing asset to our team. There are so many instances where we reached out to Pipedrive Support only to be told what we were requesting wasn't available. I had begun to believe we made a big mistake in licensing the Pipedrive platform until I met Dan. His deep knowledge of Pipedrive has allowed us to have the platform perform the way we imagined, but we would have NEVER gotten there without Dan. Dan's expertise extends far beyond Pipedrive and includes his ability to connect other solutions — like MailChimp, Outfunnel, and Zapier — to deliver the solution we are very excited to be using. I highly recommend Dan to anyone trying to navigate Pipedrive!",
  },
  {
    quote:
      "Daniel has done a fantastic job. He was very patient and really took the time to understand our needs, which kept changing (sorry Dan!)! We used Dan to integrate MailChimp with Pipedrive, automate our website and Facebook enquiries to go straight into Pipedrive, and also create a few automations within Pipedrive. His knowledge is superb — he could do everything we needed him to do and if we threw something new into the mix he quickly worked out how to do it. My experience with Dan has been excellent. Dan is also a really nice guy and very easy to work with. I would definitely recommend him, we will be using him again.",
  },
  {
    quote:
      "Dan helped us with a really complex Pipedrive setup, including integrating multiple platforms and automations. The process he implemented has streamlined our business and is saving myself and the team hours every week. I highly recommend Dan and can't wait to work with him again. 5 Stars!",
  },
  {
    quote:
      "Dan is a consummate professional and was an absolute pleasure to work with. His skillset enabled us to create a truly useful CRM system and maximise its features. We look forward to working with Dan again. Highly recommend.",
  },
  {
    quote:
      "Dan went above and beyond to understand and optimise our needs, and was very flexible with us throughout the project. Very positive experience.",
  },
  {
    quote: "Dan was awesome — would definitely hire him again!",
  },
  {
    quote:
      "Daniel was outstanding to work with. His expertise with Pipedrive and Zapier is immense, and he was a huge help with everything we needed done. Excited to get to use our new automations and become more efficient. We'll no doubt use him again in the future. Highly recommend!",
  },
  {
    quote: "He knows his stuff, that's for sure! I highly recommend Dan.",
  },
  {
    quote:
      "Dan is a knowledgeable resource and greatly helped our Pipedrive implementation. His professionalism and experience made this easy. We'll come back to Dan with any future CRM needs.",
  },
  {
    quote:
      "Daniel was superb. He took the time to properly understand what we were looking to achieve and delivered a straightforward set of automations which has saved us a huge amount of time.",
  },
  {
    quote: "Amazing to work with. Will use again.",
  },
  {
    quote:
      "Dan is very knowledgeable and great to work with. He brings not only a robust understanding of Pipedrive as a tool, but also experience with how to integrate it into a successful sales process. He is responsive and prepared. Highly recommend!",
  },
];

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
