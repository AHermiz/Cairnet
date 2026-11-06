'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BOOK, CTA, nav, navCall } from '@/lib/content';
import MobileMenu, { MenuToggle } from './MobileMenu';

/**
 * Sticky bar, charcoal ground.
 *
 * No Signal anywhere in it, on purpose. A red mark that sits on screen the whole
 * time the page does is chrome by definition, and the brand's rule is that red
 * marks meaning. The sale button here is a ghost; the filled Signal button waits
 * for the hero and the close, where it is the payoff rather than furniture.
 *
 * The lifted state is a translucent material, styled in globals.css under
 * `.nav-material`. This component only reports whether the page has scrolled, so
 * the nav no longer pulls in Framer Motion; the reduced-motion block in
 * globals.css zeroes the transition the same way it does every other one.
 *
 * `showCta` is off on the booking page, where the button would link to the page
 * you're already on.
 *
 * Below `lg` the links and the CTA give way to a menu toggle (MobileMenu.tsx).
 * It was `md` until 2026-11-03, but at 768px the full row has no room and every
 * label wrapped onto two or three lines.
 * The menu has to render outside the header: the header's backdrop-filter makes
 * it the containing block for anything fixed inside it, which would pin the
 * overlay to the 64px bar instead of the screen. While the menu is open the bar
 * sits above it and drops its lifted material, so the toggle reads on the menu.
 */
export default function Nav({ showCta = true }: { showCta?: boolean }) {
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    // Passive, and React bails out of a set to the same value, so scrolling
    // re-renders only at the 24px crossing.
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        // Fixed rather than sticky. A sticky header sits in normal flow, so it was
        // pushing the hero down by its own height and shunting the bottom of a
        // 100svh hero below the fold. Fixed takes it out of flow and lets the hero
        // start at the top of the viewport with the bar floating over it. Sections
        // below clear it through the :target scroll-margin in globals.css.
        className={`nav-material fixed inset-x-0 top-0 ${menuOpen ? 'z-modal' : 'z-sticky'}`}
        data-lifted={(lifted && !menuOpen) || undefined}
      >
        <nav className="frame flex h-[64px] items-center justify-between gap-4 sm:h-[72px]" aria-label="Main">
          <a
            href="/#top"
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
            <ul className="hidden items-center gap-7 lg:flex">
              {[...nav, navCall].map((item) => (
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

            {showCta && (
              <a
                href={BOOK}
                className="hidden whitespace-nowrap rounded-brand border border-stone px-3 py-2 lg:inline-block text-xs font-bold text-offwhite transition-[border-color,background-color,transform] duration-200 ease-state hover:border-offwhite hover:bg-surface active:scale-[0.97] sm:px-4 sm:text-sm"
              >
                {CTA}
              </a>
            )}

            <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} buttonRef={toggleRef} />
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />
    </>
  );
}
