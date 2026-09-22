'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ease } from '@/lib/tokens';
import { useEntrance } from '@/lib/useEntrance';

/**
 * Scroll triggered reveal for anything below the fold.
 *
 * Same contract as the hero: the resting state is the default, and the movement
 * is added on top only when the document is genuinely visible and the reader has
 * not asked for reduced motion. `whileInView` alone almost handles that, since
 * scrolling to something implies looking at it, but a tall viewport can have a
 * section already in frame on load, and then a hidden document leaves it at
 * opacity 0 forever. `useEntrance` closes that case.
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
  const mayAnimate = useEntrance();

  if (!mayAnimate) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // `amount` is a fraction of the ELEMENT, not of the viewport, so a tall
      // element needs proportionally more of itself on screen before it fires.
      // At 0.25 the 599px front-door card needed 150px visible while the 227px
      // cards beside it needed 57px, so the most important card on the page was
      // still blank while its neighbours had appeared. `some` fires as soon as
      // any part enters; the negative bottom margin holds it back until the
      // element is properly into frame, independent of how tall it is.
      viewport={{ once: true, amount: 'some', margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay: index * stagger, ease: ease.state }}
    >
      {children}
    </motion.div>
  );
}
