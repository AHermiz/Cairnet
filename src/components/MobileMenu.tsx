'use client';

import { cloneElement, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { BOOK, CTA, EMAIL, footer, nav, navCall } from '@/lib/content';

/**
 * The phone menu. Below `md` the bar holds the lockup and this toggle and nothing
 * else, because the full CTA beside the lockup already ran 10px past the edge at
 * 375px wide, and a menu button on top of that has nowhere to go. Both ways to
 * book live inside the menu instead.
 *
 * Modelled on Sterling Gate's kinetic navigation from 21st.dev (A's pick,
 * 2026-11-02), rebuilt rather than installed. The original runs on GSAP; this is
 * the same choreography in CSS transitions (globals.css, `.menu-*`), so the nav
 * stays free of animation libraries like the rest of the first screen:
 *
 *   1. The toggle's label rolls from Menu to Close and the plus turns to a cross.
 *   2. Three panels slide in from the right, a beat apart, in the mark's own tier
 *      order for a light ground: Stone, Slate, then Charcoal, which the menu sits
 *      on. The stones stack before the trail appears.
 *   3. The links rise into place from below a mask with a slight tilt, one after
 *      another.
 *   4. The booking button and the details fade up last.
 *
 * Closing reverses it in one move rather than replaying the stagger, because
 * someone closing a menu has already decided and should not wait for it.
 *
 * Sterling's hover effects come across too, for a narrow window with a mouse
 * and for tablets with a trackpad: the label rolls up to a copy of itself while a
 * block rises behind the row, and that link's set of background shapes pops in,
 * Sterling's own shapes in the brand palette (A, 2026-11-02, after a version with
 * the mark's stones instead). On touch, pressing a row raises the same block as
 * press feedback. The toggle's cross turns a quarter on hover.
 */

const links = [...nav, navCall];

/**
 * The ambient shapes, one set per link, each saying what its link is about (A,
 * 2026-11-02). Sterling Gate's opacities, sizes and pop timing are kept, its
 * pastel circles and waves are not:
 *
 *   Where to start  loose stones from the cairn, not yet stacked, sized and
 *                   placed like Sterling's circles, plus two more.
 *   How it works    two dotted trails across the panel, each ending at a small
 *                   cairn, the way a trail marker ends a stretch of path. The
 *                   dots are zero-length dashes with round caps, and pathLength
 *                   is the number of gaps (about 26 units each on both trails)
 *                   plus a hair, because a zero-length dash exactly at the end
 *                   of a path isn't drawn. So a dot lands on each end point and
 *                   both cairns sit the same 22 units past it.
 *   Questions       question marks in Poppins Bold, at different sizes.
 *   Book a call     a handset, with two arcs ringing off it.
 *
 * Stones use the mark's own corner ratio (radius 9 on a 26-unit stone). Colours
 * are Stone, Mist and Off-White, kept faint; Signal stays out, since red marks
 * meaning and these are atmosphere. Each top-level element is a `<g>` so the pop
 * transform in globals.css doesn't wipe out a shape's own rotation or scale, and
 * `--j` sets its place in the stagger.
 */
const stone = (x: number, y: number, w: number, h: number) => (
  <rect x={x} y={y} width={w} height={h} rx={(h * 9) / 26} />
);

const SHAPES: JSX.Element[][] = [
  [
    <g key={1} className="fill-stone" fillOpacity={0.15}>
      <g transform="rotate(-6 80 120)">{stone(34, 105, 92, 30)}</g>
    </g>,
    <g key={2} className="fill-mist" fillOpacity={0.12}>
      <g transform="rotate(4 300 80)">{stone(236, 59, 128, 42)}</g>
    </g>,
    <g key={3} className="fill-offwhite" fillOpacity={0.1}>
      <g transform="rotate(-3 200 300)">{stone(115, 272, 170, 56)}</g>
    </g>,
    <g key={4} className="fill-stone" fillOpacity={0.15}>
      <g transform="rotate(8 350 280)">{stone(317, 269, 66, 22)}</g>
    </g>,
    <g key={5} className="fill-mist" fillOpacity={0.12}>
      <g transform="rotate(5 82 214)">{stone(40, 200, 84, 28)}</g>
    </g>,
    <g key={6} className="fill-stone" fillOpacity={0.15}>
      <g transform="rotate(-4 302 207)">{stone(250, 190, 104, 34)}</g>
    </g>,
  ],
  [
    <g key={1}>
      <path
        d="M-20 210 Q70 130, 160 200 T 278 196"
        pathLength={13.001}
        className="stroke-stone"
        strokeOpacity={0.25}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray="0 1"
      />
    </g>,
    <g key={2} className="fill-offwhite" fillOpacity={0.18}>
      {stone(300, 183, 44, 14)}
      {stone(305, 166, 34, 13)}
      {stone(310, 150, 22, 12)}
    </g>,
    <g key={3}>
      <path
        d="M-20 300 Q60 240, 140 290 T 232 320"
        pathLength={11.001}
        className="stroke-mist"
        strokeOpacity={0.18}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray="0 1"
      />
    </g>,
    <g key={4} className="fill-mist" fillOpacity={0.2}>
      {stone(254, 312, 34, 11)}
      {stone(258, 298, 26, 10)}
      {stone(262, 285, 16, 9)}
    </g>,
  ],
  [
    ...(
      [
        [70, 150, 90, 'fill-stone', 0.2],
        [292, 150, 150, 'fill-mist', 0.12],
        [180, 360, 200, 'fill-offwhite', 0.1],
        [345, 330, 70, 'fill-stone', 0.25],
        [92, 330, 50, 'fill-mist', 0.25],
      ] as const
    ).map(([x, y, size, fill, opacity], k) => (
      <g key={k}>
        <text
          x={x}
          y={y}
          fontSize={size}
          textAnchor="middle"
          className={`font-sans font-bold ${fill}`}
          fillOpacity={opacity}
        >
          ?
        </text>
      </g>
    )),
  ],
  [
    // Lucide's handset (ISC, already a dependency), drawn at 9x on its 24 grid.
    <g key={1} className="stroke-offwhite" strokeOpacity={0.14}>
      <g transform="translate(92 120) scale(9)" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      </g>
    </g>,
    <g key={2} className="stroke-mist" strokeOpacity={0.2}>
      <g transform="translate(92 120) scale(9)" fill="none" strokeWidth={1.6} strokeLinecap="round">
        <path d="M14.05 6A5 5 0 0 1 18 10" />
      </g>
    </g>,
    <g key={3} className="stroke-stone" strokeOpacity={0.25}>
      <g transform="translate(92 120) scale(9)" fill="none" strokeWidth={1.6} strokeLinecap="round">
        <path d="M14.05 2a9 9 0 0 1 8 7.94" />
      </g>
    </g>,
  ],
];

export function MenuToggle({
  open,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}
      data-open={open || undefined}
      className="menu-toggle flex h-11 items-center gap-3 rounded-brand border border-stone pl-4 pr-3 text-sm font-bold text-offwhite transition-[border-color,background-color,transform] duration-200 ease-state hover:border-offwhite hover:bg-surface active:scale-[0.97] lg:hidden"
    >
      <span aria-hidden className="menu-toggle-label relative block h-[1.5em] overflow-hidden">
        <span className="block">Menu</span>
        <span className="block">Close</span>
      </span>
      {/* A plus built from two rounded rects, as on the FAQ rows, turning to a cross. */}
      <span aria-hidden className="menu-toggle-turn block">
        <span className="menu-toggle-icon relative block h-4 w-4">
          <span className="absolute left-0 top-[7px] h-[2px] w-4 rounded-brand bg-offwhite" />
          <span className="absolute left-[7px] top-0 h-4 w-[2px] rounded-brand bg-offwhite" />
        </span>
      </span>
    </button>
  );
}

export default function MobileMenu({
  open,
  onClose,
  toggleRef,
}: {
  open: boolean;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLButtonElement>;
}) {
  const firstLink = useRef<HTMLAnchorElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const behind = [document.getElementById('main'), document.querySelector('footer')];
    const root = document.documentElement;
    // Set here rather than as a prop, since React 18's types don't know `inert`.
    if (overlay.current) overlay.current.inert = !open;

    if (open) {
      behind.forEach((el) => el && (el.inert = true));
      root.style.overflow = 'hidden';
      // After the panels have started moving, so focus doesn't land on a link
      // that is still below its mask.
      const t = window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 300);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onKey);
      wasOpen.current = true;
      return () => {
        window.clearTimeout(t);
        window.removeEventListener('keydown', onKey);
      };
    }

    behind.forEach((el) => el && (el.inert = false));
    root.style.overflow = '';
    if (wasOpen.current) toggleRef.current?.focus({ preventScroll: true });
    wasOpen.current = false;
  }, [open, onClose, toggleRef]);

  // The menu only exists below lg. Widening the window past it closes the menu
  // rather than leaving the page inert behind a panel nobody can see.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && onClose();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [onClose]);

  return (
    <div
      ref={overlay}
      id="mobile-menu"
      className="menu-overlay fixed inset-0 z-overlay lg:hidden"
      data-open={open || undefined}
      aria-hidden={!open}
    >
      <span aria-hidden className="menu-layer bg-stone" style={{ '--i': 0 } as React.CSSProperties} />
      <span aria-hidden className="menu-layer bg-slate" style={{ '--i': 1 } as React.CSSProperties} />
      <div
        className="menu-layer flex flex-col overflow-y-auto bg-charcoal pt-[88px]"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {SHAPES.map((shape, i) => (
            <svg key={i} className="menu-shape absolute inset-0 h-full w-full" data-i={i} viewBox="0 0 400 400" fill="none">
              {shape.map((el, j) => cloneElement(el, { key: j, style: { '--j': j } as React.CSSProperties }))}
            </svg>
          ))}
        </span>

        <nav aria-label="Menu" className="frame relative flex flex-1 flex-col pb-10">
          <ul className="mt-6 space-y-2">
            {links.map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={item.href}
                  onClick={onClose}
                  data-i={i}
                  className="menu-link relative -mx-3 flex items-baseline gap-4 rounded-brand px-3 py-1.5 text-offwhite"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span aria-hidden className="menu-link-bg absolute inset-0 rounded-brand bg-surface-raised" />
                  <span className="relative w-6 shrink-0 text-sm font-bold tracking-label text-stone">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="menu-link-label relative block overflow-hidden text-[clamp(2.25rem,10.5vw,3.25rem)] font-bold leading-[1.1] tracking-claim">
                    <span className="menu-link-text block">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-5 pt-12">
            <a
              href={BOOK}
              onClick={onClose}
              className="menu-fade group flex w-full items-center justify-between gap-3 rounded-brand bg-signal py-1.5 pl-6 pr-1.5 text-cta font-bold text-offwhite"
              style={{ '--i': 0 } as React.CSSProperties}
            >
              {CTA}
              <span className="flex h-11 w-11 items-center justify-center rounded-brand bg-charcoal">
                <ArrowRight className="h-5 w-5 text-offwhite" strokeWidth={2} aria-hidden />
              </span>
            </a>
            <p className="menu-fade text-base text-stone" style={{ '--i': 1 } as React.CSSProperties}>
              or email{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-mist underline decoration-slate underline-offset-4"
              >
                {EMAIL}
              </a>
            </p>
            <p className="menu-fade text-sm text-stone" style={{ '--i': 2 } as React.CSSProperties}>
              {footer.area}
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
}
