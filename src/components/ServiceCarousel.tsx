'use client';

import {
  Children,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEntrance } from '@/lib/useEntrance';
import { SlotContext } from '@/lib/slot';
import './ServiceCarousel.css';

/**
 * The service folders, in one curved row (A, 2026-11-20).
 *
 * The look is Ruixen's Tilted Grid Hero on 21st.dev (MIT): a row running round
 * the inside of a cylinder, flat in the middle, bending toward the viewer at the
 * ends and fading out into the page. The reference cuts each image into sixteen
 * strips so a tile can curve along its length. A folder is live, clickable copy,
 * so it cannot be cut into strips; each one is a single flat panel set on the
 * same cylinder, using the reference's own transform (out to the axis, round it,
 * back in) and its camera distance. The curve reads in where the panels sit and
 * how they face, rather than inside each one.
 *
 * **How it behaves, as A asked for it.**
 * - The row is a ring. It glides continuously one way, right to left like the
 *   reference, and after Front Desk comes Assessment again, round and round.
 *   With four folders no folder ever shows twice: the one on the far side of
 *   the ring is fully faded while it wraps from one edge to the other. So
 *   Assessment is in the middle when the page loads, Website on its right and
 *   Front Desk, the one before it on the ring, on its left.
 * - The glide is steady, seven seconds a folder, slower than the reference's
 *   four (A, 2026-11-20). It runs only while at least half of the row is on
 *   screen, and never under prefers-reduced-motion.
 * - **Phones stand still** (A, 2026-11-20). A phone has no hover to pause the
 *   glide, so a folder could slide away while someone read it. On a phone-width
 *   row it never glides; the reader swipes. And tapping the centred folder opens
 *   one reading card with everything in it, instead of fanning the files out
 *   to be opened one at a time. See `compact` in lib/slot.ts.
 * - Under the mouse or keyboard focus it pauses, and settles on the nearest
 *   folder so that folder can be used. It carries on when the pointer leaves.
 * - Clicking, dragging or swiping stops the drift for good: the reader has taken
 *   over. Content that moves on its own for more than five seconds needs a way to
 *   stop it, WCAG 2.2.2, and that is it, as on the How it works slider.
 * - Clicking a folder at the side brings it to the middle, the short way round. Once there it is the
 *   same folder as before: click it to fan out its files, click a file to read
 *   it with the page blurred behind.
 * - It follows a finger, a mouse drag or a two-finger trackpad swipe, and lands
 *   on a folder when let go. The arrows, the dots and the left and right keys
 *   move it a folder at a time.
 *
 * Only the folder nearest the middle is live. The others are inert, so nothing in
 * them can be tabbed into or opened, and each carries one button over the top
 * whose only job is to bring it to the middle.
 *
 * **Moving it.** The row's position is a number held outside React: 0 is
 * Assessment in the middle, 1 is Website, 4 is Assessment again, and anything
 * between is the row part way. Each slot's distance from the middle is taken
 * round the ring, the short way, so it is never more than two folders. Every frame of a drift, drag or swipe writes each slot's distance from the
 * middle straight to its style, so nothing re-renders per frame. React only hears
 * about it when a different folder becomes the middle one. Landing on a folder is
 * a CSS transition. No animation library.
 */

type Props = {
  /** One name per folder, in order, for the buttons and the screen reader. */
  names: string[];
  /** What the row is, for a screen reader. */
  label: string;
  children: ReactNode;
  /** Seconds per folder while gliding. */
  secondsPerFolder?: number;
  className?: string;
};

const DRAG_START = 8; // px of sideways travel before a press becomes a drag
const FLICK = 0.18; // of a folder: a drag this far is enough to go to the next one

/** How visible a slot is at a distance from the middle. */
function fade(distance: number) {
  const a = Math.abs(distance);
  if (a <= 1) return 1 - 0.28 * a;
  return Math.max(0, 0.72 * (1 - (a - 1) / 0.6));
}

export default function ServiceCarousel({
  names,
  label,
  children,
  secondsPerFolder = 7,
  className,
}: Props) {
  const slides = Children.toArray(children);
  const n = slides.length;

  /** A distance round the ring, the short way: between -n/2 and n/2. */
  const wrap = useCallback((x: number) => x - n * Math.round(x / n), [n]);
  /** The folder a position puts in the middle. */
  const at = useCallback((p: number) => (((Math.round(p) % n) + n) % n), [n]);

  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [compact, setCompact] = useState(false);
  const mayAnimate = useEntrance(); // false under reduced motion

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faces = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef(0);
  const activeRef = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number; from: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);

  const drifting = mayAnimate && !stopped && !paused && inView && !compact && n > 1;

  // Phone width is the same 640px the stylesheet's container query uses, so
  // the shape and the behaviour change together.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setCompact(el.clientWidth <= 640);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Write the row at position `p` straight to the slots' styles. */
  const paint = useCallback((p: number) => {
    pos.current = p;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = wrap(i - p);
      const o = fade(d);
      // Wrapping round the back of the ring jumps a slot from one edge to the
      // other. It is faded out there, but a transition would still sweep it
      // across the middle on its way, so that one move happens instantly.
      const was = parseFloat(el.style.getPropertyValue('--d'));
      if (Math.abs(d - was) > n / 2) {
        el.style.transition = 'none';
        requestAnimationFrame(() => requestAnimationFrame(() => (el.style.transition = '')));
      }
      el.style.setProperty('--d', d.toFixed(4));
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0 ? 'visible' : 'hidden';
      el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
    });
    const middle = at(p);
    if (middle !== activeRef.current) {
      activeRef.current = middle;
      setActive(middle);
    }
  }, [n, wrap, at]);

  /** Moving by hand or by drift: no transition, the slots follow every frame. */
  const setMoving = (on: boolean) => stageRef.current?.toggleAttribute('data-moving', on);

  /** Land on a position, with the transition. A whole number is a folder. */
  const settle = useCallback(
    (p: number) => {
      setMoving(false);
      paint(p);
    },
    [paint],
  );

  /** The reader's own move: bring folder i to the middle the short way round,
   *  and stop drifting underneath them. */
  function go(i: number) {
    setStopped(true);
    const here = Math.round(pos.current);
    settle(here + wrap(i - here));
  }

  /** The pixels the row moves for one folder, for following a drag. */
  function pitch() {
    const st = stageRef.current;
    if (!st) return 300;
    const cs = getComputedStyle(st);
    const r = parseFloat(cs.getPropertyValue('--r')) || 600;
    const step = (parseFloat(cs.getPropertyValue('--step')) || 30) * (Math.PI / 180);
    return r * Math.sin(step);
  }

  // Drift only while the row is properly on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The glide: steady, one way, round the ring for as long as it runs. It picks
  // up from wherever the row is. When it stops for any reason, the row settles
  // on the nearest folder so that one can be used.
  useEffect(() => {
    if (!drifting) return;
    const speed = 1 / secondsPerFolder; // folders a second
    let prev = performance.now();
    let raf = 0;
    setMoving(true);
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000); // a background tab does not jump the row
      prev = now;
      paint(pos.current + speed * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      settle(Math.round(pos.current));
    };
  }, [drifting, secondsPerFolder, paint, settle]);

  // Trackpad: a sideways two-finger swipe moves the row, and it lands when the
  // swipe ends. Vertical scrolling is left alone. Non-passive so the sideways
  // swipe does not also go back a page in the browser.
  useEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    let t = 0;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('dialog')) return; // reading, not steering
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      setStopped(true);
      setMoving(true);
      paint(pos.current + e.deltaX / pitch());
      window.clearTimeout(t);
      t = window.setTimeout(() => settle(Math.round(pos.current)), 140);
    };
    st.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      st.removeEventListener('wheel', onWheel);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paint, settle]);

  // Only the middle folder is live.
  useEffect(() => {
    faces.current.forEach((el, i) => el?.toggleAttribute('inert', i !== active));
  }, [active]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // The reading card is a dialog inside the folder; its keys are its own.
    if ((e.target as HTMLElement).closest('dialog')) return;
    if (e.key === 'ArrowLeft') go(activeRef.current - 1);
    else if (e.key === 'ArrowRight') go(activeRef.current + 1);
    else return;
    e.preventDefault();
  }

  // Finger or mouse: the row follows the drag and lands on a folder when let go.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    // A reading card or page is a dialog inside a folder: touches there are
    // reading, not steering the row behind it.
    if ((e.target as HTMLElement).closest('dialog')) return;
    setStopped(true);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: pos.current, moved: false };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.moved) {
      if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(dy)) return;
      g.moved = true;
      // From where the row is now: stopping the drift may have settled it
      // since the press.
      g.from = pos.current;
      g.x = e.clientX;
      // Keep the drag when the pointer strays off the row. A browser that
      // refuses the capture still drags; it just loses the row past its edge.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* nothing to do */
      }
      setMoving(true);
      stageRef.current?.toggleAttribute('data-dragging', true);
    }
    paint(g.from - dx / pitch());
  }

  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    stageRef.current?.toggleAttribute('data-dragging', false);
    if (!g.moved) return;
    // A drag is not a click: the folder under the finger should not open.
    swallowClick.current = true;
    window.setTimeout(() => (swallowClick.current = false), 0);
    const moved = pos.current - g.from;
    const target = Math.abs(moved) >= FLICK ? (moved > 0 ? Math.ceil(g.from + FLICK) : Math.floor(g.from - FLICK)) : Math.round(g.from);
    settle(target);
  }

  return (
    <div
      ref={rootRef}
      className={`sc-root ${className ?? ''}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        ref={stageRef}
        className="sc-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (!swallowClick.current) return;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {slides.map((slide, i) => {
          const d = wrap(i - active);
          const served = wrap(i); // Assessment in the middle
          return (
            <div
              key={i}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="sc-slot"
              role="group"
              aria-roledescription="slide"
              aria-label={`${names[i]}, ${i + 1} of ${n}`}
              // The served position, Assessment in the middle. After that the
              // position is written straight to the style; this never changes,
              // so React never writes over it.
              style={
                {
                  '--d': served,
                  opacity: fade(served),
                  visibility: fade(served) > 0 ? 'visible' : 'hidden',
                  zIndex: 100 - Math.abs(served) * 10,
                } as CSSProperties
              }
            >
              <div
                ref={(el) => {
                  faces.current[i] = el;
                }}
                className="sc-face"
              >
                <SlotContext.Provider value={{ dormant: d !== 0, compact }}>{slide}</SlotContext.Provider>
              </div>
              {d !== 0 ? (
                <button
                  type="button"
                  className="sc-pick"
                  tabIndex={Math.abs(d) > 1 ? -1 : 0}
                  aria-label={`Bring ${names[i]} to the middle`}
                  onClick={() => go(i)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="sc-controls">
        <button
          type="button"
          className="sc-arrow"
          aria-label="Previous service"
          onClick={() => go(active - 1)}
        >
          <ChevronLeft aria-hidden className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <div className="sc-dots">
          {names.map((name, i) => (
            <button
              key={name}
              type="button"
              className="sc-dot"
              aria-label={`Show ${name}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="sc-arrow"
          aria-label="Next service"
          onClick={() => go(active + 1)}
        >
          <ChevronRight aria-hidden className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>

      {/* Says which folder is in the middle. Quiet while it drifts on its own, so
          a screen reader is not interrupted as it passes each one. */}
      <p className="sr-only" aria-live={drifting ? 'off' : 'polite'}>
        {names[active]}, {active + 1} of {n}
      </p>
    </div>
  );
}
