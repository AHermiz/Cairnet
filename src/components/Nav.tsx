'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { ease } from '@/lib/tokens';
import { CTA, MAILTO, nav } from '@/lib/content';

/**
 * Sticky bar, charcoal ground.
 *
 * No Signal anywhere in it, on purpose. A red mark that sits on screen the whole
 * time the page does is chrome by definition, and the brand's rule is that red
 * marks meaning. The sale button here is a ghost; the filled Signal button waits
 * for the hero and the close, where it is the payoff rather than furniture.
 */
export default function Nav() {
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 24;
    if (next !== lifted) setLifted(next);
  });

  return (
    <motion.header
      // Fixed rather than sticky. A sticky header sits in normal flow, so it was
      // pushing the hero down by its own height and shunting the bottom of a
      // 100svh hero below the fold. Fixed takes it out of flow and lets the hero
      // start at the top of the viewport with the bar floating over it. Sections
      // below clear it through the :target scroll-margin in globals.css.
      className="fixed inset-x-0 top-0 z-sticky"
      initial={false}
      animate={{
        backgroundColor: lifted ? 'rgba(28,28,30,0.88)' : 'rgba(28,28,30,0)',
        borderBottomColor: lifted ? 'rgba(74,78,88,1)' : 'rgba(74,78,88,0)',
      }}
      transition={{ duration: reduce ? 0 : 0.2, ease: ease.state }}
      style={{ borderBottomWidth: 1, backdropFilter: lifted ? 'blur(10px)' : 'none' }}
    >
      <nav className="frame flex h-[64px] items-center justify-between gap-4 sm:h-[72px]" aria-label="Main">
        <a
          href="#top"
          className="flex shrink-0 items-center transition-opacity duration-200 ease-state hover:opacity-80"
          aria-label="Cairnet, home"
        >
          {/* The full lockup at every width, including the phone, on A's call.
              46px tall is 180px wide at the lockup's 461.54 x 118, and 180px is
              the floor below which the descriptor stops being legible. It was
              45px against a stated floor of 120px until 2026-09-18; both numbers
              were wrong, and 45px put the descriptor at a 6.4px cap height right
              here in the nav. See the lockup geometry table in the brand profile.

              On the phone it runs below that floor, at 34px tall and 133px wide,
              which puts the descriptor near a 5px cap height. A's call, made with
              the tradeoff in front of him: 350px of content width minus a 196px
              CTA and a 16px gap leaves 138px, so the options were a small
              descriptor, a shortened CTA, or the bare mark. He picked keeping the
              full CTA label and the company name over descriptor legibility at
              that one size. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/cairnet-lockup-horizontal-reversed.svg"
            alt="Cairnet, AI Integration"
            width={180}
            height={46}
            className="h-[34px] w-auto sm:h-[46px]"
          />
        </a>

        <div className="flex items-center gap-6 lg:gap-10">
          <ul className="hidden items-center gap-7 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="relative block py-2 text-sm text-mist transition-colors duration-200 ease-state hover:text-offwhite after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-offwhite after:transition-[width] after:duration-200 after:ease-state hover:after:w-full"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={MAILTO}
            className="whitespace-nowrap rounded-brand border border-stone px-3 py-2 text-xs font-bold text-offwhite transition-[border-color,background-color,transform] duration-200 ease-state hover:border-offwhite hover:bg-surface active:scale-[0.97] sm:px-4 sm:text-sm"
          >
            {CTA}
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
