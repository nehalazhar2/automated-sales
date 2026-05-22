import Image from 'next/image';
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
      "Pipedrive Consultants did a super job for us! We knew we needed an automated solution for handling incoming leads and we had picked Pipedrive as our platform, but that's about all we knew. They helped us think through our current manual lead management system and then took over from there. The milestones were all hit on time and on budget. And, when unanticipated surprises came up we were able to work through them with good communication. We will definitely go back to them with any similar project. I whole-heartedly recommend Pipedrive Consultants for this type of work!",
    who: 'Carlo Franzblau',
    role: 'Founder, Electronic Learning Products',
    avatar: '/images/avatars/carlo.png',
  },
  {
    quote:
      'Pipedrive Consultants were extremely knowledgable and set-up the CRM without any problems. They were quick to respond to any queries and went out of their way to make sure the project was completed successfully. Thank you, Dan and the team, for your hard work on this project. We will definitely be hiring Pipedrive Consultants again for future projects.',
    who: 'Adam Fox',
    role: 'Founder, Insperanto Investments',
    avatar: '/images/avatars/adam.png',
  },
  {
    quote:
      'Another great project from Dan and the team. Thank you for all your help with this. Pipedrive Consultants come highly recommended and we will be continuing to work with them on an hourly contract.',
    who: 'Kirsty Griffiths',
    role: 'Head of Sales',
    avatar: '/images/avatars/kirsty.png',
  },
  {
    quote:
      'Dan is the ultimate pipedrive consultant. He implemented an amazing pipedrive process for our sales team! Look forward to working with him in the near future for additional integrations and streamlining.',
    who: 'Geeshan Subasingha',
    role: 'Partner, Net Fusion Designs',
    avatar: '/images/avatars/geeshan.jpg',
  },
  {
    quote:
      "Daniel is an absolute lifesaver! He's made the experience with Pipedrive so much better. He's a professional and gets the job done in time. He goes above and beyond and is a great person to also brainstorm ideas with the business. Across the board a great experience working with him. He brought my stress level down! Looking forward to working with Daniel again.",
    who: 'Christian Hogan',
    role: 'Head of IT and Data, Portfolio Insider',
    avatar: '/images/avatars/christian.jpeg',
  },
  {
    quote:
      'Dan went above and beyond cleaning up our Pipedrive account and creating a ton of automations. Highly recommended!!!',
    who: 'Bryan Driscoll',
    role: 'Co-Founder, Motivated Leads',
    avatar: '/images/avatars/bryan.jpg',
  },
  {
    quote:
      'We use Pipedrive as our CRM and I needed to create reports to show custom activities in one high-level view. Pipedrive can not display this information in one view. Dan created a system integrating Pipedrive, Zoom, Zapier, multiple Google Sheets, Pivot Tables, automation and more to create a view outside of the CRM that shows all our reports. I highly recommend him for this type of work!',
    who: 'Vicky',
    role: 'Junior Entrepreneur Programme',
  },
  {
    quote:
      'Really pleased with the outcome as the job required was very complex and after multiple attempts with other consultants and no joy Daniel managed to get the job done within 1/2 days. I can definitely recommend using Daniel and will definitely be keeping in touch when more work is needed.',
    who: 'Mike Katasi',
    role: 'Buyer, Official Watches',
    avatar: '/images/avatars/mike.png',
  },
  {
    quote:
      'Daniel has extensive knowledge and experience with Pipedrive and proposed very accurate and valuable solutions to our issues. His contribution was instrumental with the implementation and in getting started with the software.',
    who: 'Peter Trataris',
    role: 'Founder, Bluefields Trading',
  },
  {
    quote: 'Excellent support and knowledge from Dan. Thank you for all your great input!',
    who: "Michael O'Callaghan",
    role: 'CEO, CourseCo',
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
            {TESTIMONIALS.map((t) => {
              const hasAvatar = 'avatar' in t && typeof t.avatar === 'string';
              const initials = t.who
                .split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase();
              return (
                <article key={t.who} className="as-card">
                  <div className="as-stars">★★★★★</div>
                  <p style={{ marginTop: 12 }}>{t.quote}</p>
                  <div className="as-attribution">
                    <div className="as-avatar" aria-hidden={!hasAvatar}>
                      {hasAvatar ? (
                        <Image src={t.avatar as string} alt={t.who} width={88} height={88} />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--slate-950)', color: '#fff',
                          fontWeight: 900, fontSize: 14,
                        }}>{initials}</div>
                      )}
                    </div>
                    <div>
                      <div className="as-attribution-name">{t.who}</div>
                      <div className="as-attribution-role">{t.role}</div>
                    </div>
                  </div>
                </article>
              );
            })}
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
