'use client';

import { useEffect, useRef, useState } from 'react';

export type Testimonial = {
  quote: string;
};

type Props = {
  testimonials: Testimonial[];
  /** Auto-scroll speed in pixels per second. Set to 0 to disable. */
  speed?: number;
  /** Quotes longer than this (chars) get a Read more toggle. */
  readMoreThreshold?: number;
};

const DRAG_THRESHOLD = 6;

export default function TestimonialsMarquee({
  testimonials,
  speed = 30,
  readMoreThreshold = 180,
}: Props) {
  // Duplicate the list so the scroll loop appears seamless.
  const track = [...testimonials, ...testimonials];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Pointer state lives in a ref so handlers don't re-bind on every move.
  const pointer = useRef({
    down: false,
    captured: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
    pointerId: -1,
  });

  const pausedRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || speed === 0) return;

    let frame = 0;

    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!pausedRef.current) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += speed * dt;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onEnter = () => { pausedRef.current = true; };
    const onLeave = () => { pausedRef.current = false; lastTsRef.current = null; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [speed]);

  // Pause auto-scroll while any quote is expanded.
  useEffect(() => {
    if (expanded.size > 0) pausedRef.current = true;
    else if (!isDragging) pausedRef.current = false;
  }, [expanded, isDragging]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only react to primary button.
    if (e.button !== undefined && e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;
    pointer.current = {
      down: true,
      captured: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
      pointerId: e.pointerId,
    };
    // Do NOT capture the pointer or call setIsDragging yet — wait until we've
    // actually moved enough to count as a drag. Otherwise clicks on inner
    // buttons (Read more) never fire.
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p.down) return;
    const el = containerRef.current;
    if (!el) return;

    const dx = e.clientX - p.startX;
    const abs = Math.abs(dx);
    p.moved = Math.max(p.moved, abs);

    if (!p.captured) {
      if (abs < DRAG_THRESHOLD) return;
      // Promote to a drag now.
      p.captured = true;
      pausedRef.current = true;
      setIsDragging(true);
      el.setPointerCapture(p.pointerId);
    }

    el.scrollLeft = p.startScroll - dx;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft < 0) {
      el.scrollLeft += half;
      p.startScroll += half;
    } else if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
      p.startScroll -= half;
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p.down) return;
    const el = containerRef.current;
    if (el && p.captured && el.hasPointerCapture(p.pointerId)) {
      el.releasePointerCapture(p.pointerId);
    }
    const wasDrag = p.captured;
    pointer.current.down = false;
    pointer.current.captured = false;
    if (wasDrag) {
      setIsDragging(false);
      if (expanded.size === 0) pausedRef.current = false;
      lastTsRef.current = null;
    }
  };

  // If we promoted to a drag, swallow the synthetic click that would follow.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pointer.current.moved > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
    pointer.current.moved = 0;
  };

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className={`as-testimonials-marquee${isDragging ? ' is-dragging' : ''}`}
      aria-label="Client testimonials"
      role="region"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClickCapture={onClickCapture}
    >
      <div className="as-testimonials-track">
        {track.map((t, i) => {
          const isLong = t.quote.length > readMoreThreshold;
          const isOpen = expanded.has(i);
          return (
            <article key={i} className="as-card as-testimonials-item">
              <div className="as-stars">★★★★★</div>
              <p className={`as-testimonials-quote${isOpen ? ' is-expanded' : ''}`}>{t.quote}</p>
              {isLong && (
                <button
                  type="button"
                  className="as-readmore"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                >
                  {isOpen ? 'Show less' : 'Read more'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
