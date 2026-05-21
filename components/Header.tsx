import Link from 'next/link';
import Image from 'next/image';
import { NAV, SITE_NAME } from '@/lib/site';
import MobileNavToggle from './MobileNavToggle';

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="as-header-inner">
        <Link href="/" className="as-logo" aria-label={SITE_NAME}>
          <Image
            src="/images/logo.png"
            alt={SITE_NAME}
            width={48}
            height={48}
            priority
          />
          <span className="as-logo-title">{SITE_NAME}</span>
        </Link>

        <nav className="as-nav" aria-label="Primary navigation">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className="as-header-cta" href="/contact-2/">
          Book a call
        </Link>

        <MobileNavToggle />
      </div>

      <nav id="ase-mobile-nav" className="as-mobile-nav" aria-label="Mobile navigation">
        <ul>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
