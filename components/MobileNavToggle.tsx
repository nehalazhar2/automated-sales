'use client';

import { useEffect, useState } from 'react';

export default function MobileNavToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById('ase-mobile-nav');
    if (!nav) return;
    nav.classList.toggle('open', open);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickNav(e: Event) {
      const target = e.target as HTMLElement;
      if (target.closest('a')) setOpen(false);
    }
    const nav = document.getElementById('ase-mobile-nav');
    document.addEventListener('keydown', onKey);
    nav?.addEventListener('click', onClickNav);

    const mql = window.matchMedia('(min-width: 1101px)');
    const onResize = (m: MediaQueryListEvent) => { if (m.matches) setOpen(false); };
    mql.addEventListener('change', onResize);

    return () => {
      document.removeEventListener('keydown', onKey);
      nav?.removeEventListener('click', onClickNav);
      mql.removeEventListener('change', onResize);
    };
  }, []);

  return (
    <button
      className="as-mobile-toggle"
      type="button"
      aria-expanded={open}
      aria-controls="ase-mobile-nav"
      onClick={() => setOpen((o) => !o)}
    >
      <span className="screen-reader-text">{open ? 'Close menu' : 'Open menu'}</span>
      Menu
    </button>
  );
}
