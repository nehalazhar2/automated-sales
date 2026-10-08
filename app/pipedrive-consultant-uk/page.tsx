import MarketPage from '@/components/MarketPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Consultant UK | Platinum Partner',
  description:
    'Hire a Platinum Pipedrive Partner in the UK. Setup, automation, integrations and training from a Pipedrive Advisory Council member. Book a free CRM audit.',
  path: '/pipedrive-consultant-uk/',
});

const FAQS = [
  {
    q: 'How much does a Pipedrive consultant cost in the UK?',
    a: 'It depends on scope. A small setup is a short project, while a multi-team build with integrations takes longer. After a free CRM audit we give you a clear quote before any work starts.',
  },
  {
    q: 'Can you move us from HubSpot, Salesforce or spreadsheets to Pipedrive?',
    a: 'Yes. We map your data, import it, rebuild your pipeline and automations, and train your team.',
  },
  {
    q: 'Do you work with UK businesses remotely?',
    a: 'Yes. Most work is done online with video calls, and in-person engagements in the UK are available by arrangement.',
  },
  {
    q: 'Can I buy my Pipedrive licences through you?',
    a: 'Yes. As a Platinum Pipedrive Partner we can help you choose the right plan, set up your account and configure it properly from day one. You can also start with an extended free trial.',
  },
  {
    q: 'Can Pipedrive be configured to support our data protection obligations?',
    a: 'Pipedrive provides data-protection tools, and we configure consent fields, retention and access permissions to suit your policies. This is not legal advice, so check your obligations with your own advisor.',
  },
];

export default function Page() {
  return (
    <MarketPage
      path="/pipedrive-consultant-uk/"
      crumb="Pipedrive Consultant UK"
      countryName="United Kingdom"
      serviceName="Pipedrive consultant (UK)"
      heroHeading="Pipedrive consultant for UK businesses."
      heroLead="A Platinum Pipedrive Partner helping UK sales teams set up, automate and get more from Pipedrive."
      introHeading="A Pipedrive consultancy that knows the UK market."
      intro={[
        'Automated Sales is a Platinum Pipedrive Partner and Pipedrive Advisory Council member. We set Pipedrive up properly, automate the repetitive work, connect it to the rest of your tools and train your team to use it.',
        "With 200+ Pipedrive projects delivered, we know where Pipedrive works brilliantly and where it needs a helping hand. We're headquartered in Cardiff, UK and work with UK businesses of every size.",
      ]}
      whyHeading="What our Pipedrive consultants do for UK teams."
      why="Most teams buy Pipedrive, import a spreadsheet and stop there. A good consultant makes sure the pipeline reflects how you really sell, reps update it without being chased, and managers can trust the numbers."
      audience="UK businesses that sell to other businesses and have outgrown spreadsheets, or want more from the CRM they already have, across professional services, property, agencies, software and more."
      faqs={FAQS}
      otherMarkets={[
        { href: '/pipedrive-consultant-uae/', label: 'Pipedrive consultant in the UAE' },
        { href: '/pipedrive-consultant-usa/', label: 'Pipedrive consultant in the USA' },
      ]}
    />
  );
}
