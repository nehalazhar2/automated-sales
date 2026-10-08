import MarketPage from '@/components/MarketPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Consultant UAE | Dubai & Abu Dhabi',
  description:
    'Platinum Pipedrive Partner serving Dubai, Abu Dhabi and the UAE. CRM setup, automation, integrations and training. Book a free 30-minute CRM audit.',
  path: '/pipedrive-consultant-uae/',
});

const FAQS = [
  {
    q: 'Do you work with businesses in Dubai and Abu Dhabi?',
    a: 'Yes. We work with teams across the UAE, mostly online, with in-person meetings available by arrangement.',
  },
  {
    q: 'How much does Pipedrive consulting cost in the UAE?',
    a: 'It depends on scope. After a free CRM audit we give you a clear quote before any work starts.',
  },
  {
    q: 'Can Pipedrive work with WhatsApp?',
    a: 'Yes, through integrations and automation tools. We will recommend the best option for your volume and budget as part of the audit.',
  },
  {
    q: 'Can I buy my Pipedrive licences through you?',
    a: 'Yes. As a Platinum Pipedrive Partner we can help you choose the right plan, set up your account and configure it properly from day one. You can also start with an extended free trial.',
  },
  {
    q: 'How do you handle customer data and privacy?',
    a: 'We configure permissions, consent fields and retention in line with your own policies and the data-protection rules that apply to you. This is not legal advice, so check your obligations with your own advisor.',
  },
];

export default function Page() {
  return (
    <MarketPage
      path="/pipedrive-consultant-uae/"
      crumb="Pipedrive Consultant UAE"
      countryName="United Arab Emirates"
      serviceName="Pipedrive consultant (UAE)"
      heroHeading="Pipedrive consultant for UAE businesses."
      heroLead="A Platinum Pipedrive Partner supporting sales teams across Dubai, Abu Dhabi and the wider UAE."
      introHeading="Global Pipedrive expertise, available in the UAE."
      intro={[
        'Automated Sales is a Platinum Pipedrive Partner and Pipedrive Advisory Council member. We set up Pipedrive around the way you sell, automate follow-ups, connect your tools and train your team.',
        'With 200+ Pipedrive projects delivered, we bring global experience to businesses across Dubai, Abu Dhabi and the rest of the UAE.',
      ]}
      whyHeading="What our Pipedrive consultants do for UAE teams."
      why="Fast-moving sales teams often manage leads across WhatsApp, email, portals and spreadsheets. Pipedrive brings them into one pipeline, and a consultant makes sure every enquiry is assigned, followed up and visible to management."
      audience="UAE businesses with a sales process to organise, from owner-led companies to growing sales teams in real estate, recruitment, agencies, professional services and software."
      faqs={FAQS}
      otherMarkets={[
        { href: '/pipedrive-consultant-uk/', label: 'Pipedrive consultant in the UK' },
        { href: '/pipedrive-consultant-usa/', label: 'Pipedrive consultant in the USA' },
      ]}
    />
  );
}
