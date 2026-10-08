import MarketPage from '@/components/MarketPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Consultant USA | Platinum Partner',
  description:
    'Platinum Pipedrive Partner working with US businesses across all time zones. CRM setup, automation, integrations and training. Book a free CRM audit.',
  path: '/pipedrive-consultant-usa/',
});

const FAQS = [
  {
    q: 'Do you work with US businesses and cover US time zones?',
    a: 'Yes. We work with US clients and schedule calls, training and support across Eastern, Central, Mountain and Pacific time.',
  },
  {
    q: 'How much does a Pipedrive consultant cost in the US?',
    a: 'It depends on scope. A small setup is a short project, while a multi-team build with integrations takes longer. After a free CRM audit we give you a clear quote before any work starts.',
  },
  {
    q: 'Can you migrate us from HubSpot, Salesforce or spreadsheets to Pipedrive?',
    a: 'Yes. We map your data, import it, rebuild your pipeline and automations, and train your team.',
  },
  {
    q: 'Can I buy my Pipedrive licenses through you?',
    a: 'Yes. As a Platinum Pipedrive Partner we can help you choose the right plan, set up your account and configure it properly from day one. You can also start with an extended free trial.',
  },
  {
    q: 'Can Pipedrive be configured around our privacy and email compliance policies?',
    a: 'Pipedrive provides data-protection tools, and we configure consent fields, opt-out handling, retention and access permissions to match your own policies, including those that reflect CAN-SPAM and US state privacy laws. This is not legal advice, so check your obligations with your own advisor.',
  },
];

export default function Page() {
  return (
    <MarketPage
      path="/pipedrive-consultant-usa/"
      crumb="Pipedrive Consultant USA"
      countryName="United States"
      serviceName="Pipedrive consultant (USA)"
      heroHeading="Pipedrive consultant for US businesses."
      heroLead="A Platinum Pipedrive Partner helping US sales teams set up, automate and get more from Pipedrive."
      introHeading="Platinum Pipedrive expertise for US sales teams."
      intro={[
        'Automated Sales is a Platinum Pipedrive Partner and Pipedrive Advisory Council member. We set Pipedrive up properly, automate the repetitive work, connect it to the rest of your tools and train your team to use it.',
        'With 200+ Pipedrive projects delivered, we work with US businesses of every size and cover US time zones for calls, training and support.',
      ]}
      whyHeading="What our Pipedrive consultants do for US teams."
      why="Most teams buy Pipedrive, import a spreadsheet and stop there. A good consultant makes sure the pipeline reflects how you really sell, reps update it without being chased, and managers can trust the forecast."
      audience="US businesses that sell to other businesses and have outgrown spreadsheets, or want more from the CRM they already have, across software, agencies, professional services, real estate and more."
      faqs={FAQS}
      otherMarkets={[
        { href: '/pipedrive-consultant-uk/', label: 'Pipedrive consultant in the UK' },
        { href: '/pipedrive-consultant-uae/', label: 'Pipedrive consultant in the UAE' },
      ]}
    />
  );
}
