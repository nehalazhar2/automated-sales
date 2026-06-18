export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
  'https://www.automated-sales.com';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Automated Sales';

export const SITE_DESCRIPTION =
  'Our Pipedrive Consultants develop marketing automation, sales systems, business processes and integrations which improve efficiency and drive profit.';

export const NAV: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/pipedrive-consultant/', label: 'Pipedrive' },
  { href: '/ai-consultants/', label: 'AI' },
  { href: '/zapier-consultants/', label: 'Zapier' },
  { href: '/active-campaign-consultants/', label: 'ActiveCampaign' },
  { href: '/website-design/', label: 'Website Design' },
  { href: '/pipedrive-zapier-active-campaign-services/', label: 'Services' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Blog' },
  { href: '/contact-2/', label: 'Contact' },
];

export const FOOTER_LINKS = {
  'Core pages': [
    { href: '/', label: 'Home' },
    { href: '/pipedrive-consultant/', label: 'Pipedrive' },
    { href: '/pipedrive-zapier-active-campaign-services/', label: 'Services' },
    { href: '/projects/', label: 'Projects' },
  ],
  Specialisms: [
    { href: '/ai-consultants/', label: 'AI' },
    { href: '/zapier-consultants/', label: 'Zapier' },
    { href: '/active-campaign-consultants/', label: 'ActiveCampaign' },
    { href: '/website-design/', label: 'Website design' },
    { href: '/blog/', label: 'Blog' },
  ],
  'Pipedrive services': [
    { href: '/pipedrive-expert/', label: 'Pipedrive Expert' },
    { href: '/pipedrive-implementation/', label: 'Pipedrive Implementation' },
    { href: '/pipedrive-setup/', label: 'Pipedrive Setup' },
    { href: '/pipedrive-help/', label: 'Pipedrive Help' },
    { href: '/pipedrive-training/', label: 'Pipedrive Training' },
    { href: '/pipedrive-integration/', label: 'Pipedrive Integration' },
    { href: '/pipedrive-automation/', label: 'Pipedrive Automation' },
    { href: '/pipedrive-partner/', label: 'Pipedrive Partner' },
    { href: '/free-pipedrive-trial-extended/', label: 'Pipedrive Free Trial' },
    { href: 'https://leadrouter.automated-sales.com/', label: 'Pipedrive Lead Router' },
    { href: 'https://pipedrivemcp.automated-sales.co/', label: 'Pipedrive Claude MCP' },
  ],
  Company: [
    { href: '/about-2/', label: 'About' },
    { href: '/testimonials/', label: 'Testimonials' },
    { href: '/contact-2/', label: 'Contact' },
    { href: '/privacy/', label: 'Privacy' },
  ],
};
