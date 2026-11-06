'use client';

import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { useEntrance } from '@/lib/useEntrance';
import './Reveal.css';

/**
 * Scroll triggered reveal for anything below the fold.
 *
 * **CSS and an IntersectionObserver, not Framer Motion (2026-11-02).** The same
 * trade the hero made: Framer was hydrating on every section for a fade, and the
 * mobile Lighthouse score was paying for it. The observer only flips an
 * attribute; the movement is a CSS transition in Reveal.css.
 *
 * Same contract as the hero: the resting state is the default, and the movement
 * is added on top only when the document is genuinely visible and the reader has
 * not asked for reduced motion. Server render and first paint draw the content
 * in place; `useEntrance` decides whether it may be hidden to be revealed, so a
 * background tab or a prerenderer never sees an empty section.
 *
 * The observer's negative bottom margin holds the reveal back until the element
 * is properly into frame, independent of how tall it is. A threshold would not:
 * it is a fraction of the ELEMENT, so the 599px front-door card once needed 150px
 * on screen while the cards beside it needed 57px.
 *
 * `index` staggers siblings. Staggering one list is legitimate; the tell is the
 * same entrance applied uniformly to every section on the page, so the sections
 * below use this at different amounts or not at all.
 */
export default function Reveal({
  children,
  index = 0,
  className,
  y = 18,
  stagger = 0.08,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  y?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mayAnimate = useEntrance();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!mayAnimate || seen) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setSeen(true);
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mayAnimate, seen]);

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      data-reveal={mayAnimate && !seen ? 'pending' : undefined}
      style={{ '--reveal-y': `${y}px`, transitionDelay: `${index * stagger}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
