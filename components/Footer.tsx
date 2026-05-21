import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_LINKS, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="as-container as-footer-grid">
        <div>
          <Link href="/" className="as-logo" aria-label={SITE_NAME}>
            <Image
              src="/images/logo.png"
              alt={SITE_NAME}
              width={40}
              height={40}
            />
            <span>
              <span className="as-logo-title">{SITE_NAME}</span>
              <br />
              <span className="as-logo-subtitle">CRM, automation and AI consultancy</span>
            </span>
          </Link>
          <p>{SITE_DESCRIPTION}</p>
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <div className="as-footer-title">{title}</div>
            <div className="as-footer-links">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
