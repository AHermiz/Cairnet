'use client';

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';
import { mark } from '@/lib/tokens';
import { SlotContext } from '@/lib/slot';
import { useEntrance } from '@/lib/useEntrance';
import Photo from './Photo';
import './ServiceFolder.css';

/**
 * One service as a folder. Opening it fans out the files inside; clicking a file
 * pulls it out and grows it into a reading card.
 *
 * Built from Kedhareswer Naidu's Glassmorphism Folder Cards on 21st.dev (MIT),
 * picked by A on 2026-11-02 to make the service cards livelier. The mechanics are
 * the reference's: a back panel with a tab, files in the pocket, a glass front
 * hinged at its bottom edge, a lean toward the pointer, and an entrance where the
 * folder assembles itself. What is different, and why:
 *
 * 1. **The front holds the card's copy, so it is in normal flow.** The reference
 *    scales a fixed 340 x 272 stage, which is fine for a label and useless for a
 *    paragraph. Here the front is measured and both folder outlines are drawn for
 *    the size it came out at, so the text wraps like any other text and the
 *    folder grows to fit it. Nothing is absolutely sized, so there is no layout
 *    shift when React arrives: before it does, the folder is a plain rounded
 *    card with the right height.
 * 2. **The files open.** In the reference a file is a button with nowhere to go.
 *    Here it opens a `<dialog>`, which brings focus trapping, Escape and the
 *    inert page behind it for free, and the card rises out of the folder's
 *    pocket and drops back onto its file (pocketFlight, Web Animations API, no
 *    animation library).
 * 3. **The entrance is CSS and the content is visible by default.** The same
 *    contract as `Reveal` and the hero: the folder is drawn finished, and only a
 *    document that is visible, with motion allowed, hides it to assemble it.
 * 4. **Brand pieces.** The brand's one corner radius instead of 22px, tier colours
 *    instead of generated marble, Poppins instead of the system stack, and no
 *    "+ add a file" key, because a visitor has nothing to add.
 */

export type FolderBlock = { p: string } | { heading?: string; list: string[] };
export type FolderFile = { name: string; meta?: string; blocks: FolderBlock[] };

type Props = {
  name: string;
  promise: string;
  /** The description, always on the front. */
  closed: ReactNode;
  /** What opening adds under it. */
  open: ReactNode;
  /** The same, drawn for white paper: the phone's reading card is always paper,
   *  so a dark folder's button needs its light-ground version there. Defaults
   *  to `open`, which is right for a folder that is already light. */
  paperOpen?: ReactNode;
  toggleLabel: string;
  files: FolderFile[];
  tone?: 'dark' | 'light';
  /** The Statement family's edge blaze, which marks the front door. */
  blaze?: boolean;
  /** Stagger between folders, in ms. */
  delay?: number;
  /** A photograph on the back panel, by its name in public/media. */
  photo?: string;
  /** Where the print's 4:3 crop falls. */
  photoPosition?: string;
};

// Outline geometry, in px. The tab shapes are the reference's, kept at their
// absolute size so they read the same at any width.
const HEAD = 104; // room above the folder for the fanned files
const PEEK = 74; // how far the back rises above the front
const R = mark.radius;

/** The back panel: a body with a tab on the right. */
function backPath(w: number, h: number) {
  return `M0 ${34 + R}A${R} ${R} 0 0 1 ${R} 34L146 34C170 34 172 0 198 0L${w - R} 0A${R} ${R} 0 0 1 ${w} ${R}L${w} ${h - R}A${R} ${R} 0 0 1 ${w - R} ${h}L${R} ${h}A${R} ${R} 0 0 1 0 ${h - R}Z`;
}

/** The glass front: a body with a lower tab on the left. */
function frontPath(w: number, h: number) {
  return `M0 ${R}A${R} ${R} 0 0 1 ${R} 0L118 0C144 0 146 32 172 32L${w - R} 32A${R} ${R} 0 0 1 ${w} ${32 + R}L${w} ${h - R}A${R} ${R} 0 0 1 ${w - R} ${h}L${R} ${h}A${R} ${R} 0 0 1 0 ${h - R}Z`;
}

/** -1 to 1 across the fan, 0 for a single file. */
const fanSlot = (i: number, n: number) => (n <= 1 ? 0 : (i / (n - 1)) * 2 - 1);

/** A small fixed jitter per file, so the stack looks handled rather than ruled. */
function jitter(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000 - 0.5;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A reading card's way in and out of its folder (A, 2026-11-20), shared by the
 * file reader on a computer and the whole-folder card on a phone.
 *
 * Going back, the card shrinks into the exact shape of the file it came from
 * (its width, height and tilt) just above it, then drops straight down onto
 * that file, sliding behind the glass as it goes. Opening is the same thing
 * backwards.
 *
 * **The glass is the folder's real outline, tab and all.** The card draws above
 * everything, so "behind the glass" is a clip, not real layering. The first
 * version cut along one straight line at the glass's lower edge, but the front
 * has a raised tab on the left, so over the tab the card's bottom showed in
 * front of the folder (A, 2026-11-20). The cut now follows the same curve the
 * front is drawn with (frontPath).
 *
 * A cut along a curve on a moving, turning card can't be left to the browser to
 * blend between two shapes, so the flight is worked out frame by frame here:
 * every few milliseconds, where the card is and which part of it is above the
 * glass. Measured against the card at rest, so call it while the card has no
 * transform. The card's transform-origin must be its top left.
 */
function pocketFlight(card: HTMLElement, file: HTMLElement, front: HTMLElement, print: HTMLElement | null) {
  const c = card.getBoundingClientRect();
  const f = front.getBoundingClientRect();
  if (!c.width || !c.height || !file.offsetWidth || !front.offsetWidth) return null;

  // Where something really is, tilt included: the page's own position of its
  // two top corners, read off two empty markers placed in them.
  const mark = (el: HTMLElement, side: 'left' | 'right') => {
    const m = document.createElement('span');
    m.style.cssText = `position:absolute;top:0;${side}:0;width:0;height:0`;
    el.appendChild(m);
    const r = m.getBoundingClientRect();
    m.remove();
    return r;
  };
  const tl = mark(file, 'left');
  const tr = mark(file, 'right');
  const dx = tr.left - tl.left;
  const dy = tr.top - tl.top;
  const fw = Math.hypot(dx, dy);
  if (!fw) return null;
  const angle = Math.atan2(dy, dx); // radians
  const k = fw / c.width; // one even scale: the card is the file's width
  const fh = (file.offsetHeight * fw) / file.offsetWidth; // the file's height on screen
  const crop = fh / k; // the same, in the card's own pixels

  // The glass's top edge on screen, from frontPath: level with the front's top
  // over the tab, a curve down, then 32px lower to the right.
  const sc = f.width / front.offsetWidth;
  const bez = (t: number, a: number, b: number, c2: number, d: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * d;
  const edge: [number, number][] = [[-5000, 0]];
  for (let x = -40; x < 118; x += 16) edge.push([x, 0]);
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    edge.push([bez(t, 118, 144, 146, 172), bez(t, 0, 0, 32, 32)]);
  }
  for (let x = 188; x < front.offsetWidth + 40; x += 16) edge.push([x, 32]);
  edge.push([front.offsetWidth + 5000, 32]);
  const glassPts = edge.map(([x, y]) => [f.left + x * sc, f.top + y * sc] as const);
  const glassAt = (x: number) => {
    for (let i = 1; i < glassPts.length; i++) {
      const [x0, y0] = glassPts[i - 1];
      const [x1, y1] = glassPts[i];
      if (x <= x1) return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
    return glassPts[glassPts.length - 1][1];
  };

  // The photograph tucked in the front of a shut folder is in front of the
  // files too, so the card goes behind it as well: over the print, the edge to
  // hide below is the print's top. An open folder has slid it away.
  let printAt: ((x: number) => number) | null = null;
  const printXs: number[] = [];
  if (print && print.offsetWidth && Number(getComputedStyle(print).opacity) > 0.5) {
    const pl = mark(print, 'left');
    const pr = mark(print, 'right');
    if (pr.left > pl.left) {
      printAt = (x) =>
        x < pl.left || x > pr.left ? Infinity : pl.top + ((pr.top - pl.top) * (x - pl.left)) / (pr.left - pl.left);
      printXs.push(pl.left - 0.5, pl.left, pr.left, pr.left + 0.5);
      for (let x = pl.left + 16; x < pr.left; x += 16) printXs.push(x);
    }
  }
  const edgeAt = (x: number) => Math.min(glassAt(x), printAt ? printAt(x) : Infinity);
  const glass = [...glassPts.map(([x]) => x), ...printXs]
    .sort((a, b) => a - b)
    .map((x) => [x, edgeAt(x)] as const);

  // A pose: where the card's top-left corner is on screen, its turn, its scale,
  // and how much of its height shows (the rest is cropped off its bottom).
  type Pose = { x: number; y: number; a: number; k: number; b: number };
  const PAD = 80; // room for the card's shadow inside the clip
  const rest: Pose = { x: c.left, y: c.top, a: 0, k: 1, b: c.height + PAD };
  const onFile: Pose = { x: tl.left, y: tl.top, a: angle, k, b: crop };

  // Just above the file, high enough that none of it is behind the glass yet,
  // and never so close that the drop can't be seen.
  const GAP = 6;
  const down = [-Math.sin(angle) * fh, Math.cos(angle) * fh];
  const bottoms = [
    [tl.left + down[0], tl.top + down[1]],
    [tr.left + down[0], tr.top + down[1]],
  ];
  // Checked along the whole bottom edge, since the tab and the print rise above
  // the glass.
  const clear: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = bottoms[0][0] + (bottoms[1][0] - bottoms[0][0]) * t;
    const y = bottoms[0][1] + (bottoms[1][1] - bottoms[0][1]) * t;
    clear.push(y - (edgeAt(x) - GAP));
  }
  const lift = Math.max(28, ...clear);
  const above: Pose = { ...onFile, y: onFile.y - lift };

  const lerp = (p: Pose, q: Pose, t: number): Pose => ({
    x: p.x + (q.x - p.x) * t,
    y: p.y + (q.y - p.y) * t,
    a: p.a + (q.a - p.a) * t,
    k: p.k + (q.k - p.k) * t,
    b: p.b + (q.b - p.b) * t,
  });

  // The pose as a keyframe. With `behindGlass`, the part of the card below the
  // glass's edge is cut away too: the edge, taken into the card's own turned and
  // scaled pixels, becomes the bottom of the clip wherever it is higher than
  // the crop.
  const frame = (p: Pose, behindGlass: boolean) => {
    const cos = Math.cos(-p.a);
    const sin = Math.sin(-p.a);
    const local = ([vx, vy]: readonly [number, number]) => {
      const ux = (vx - p.x) / p.k;
      const uy = (vy - p.y) / p.k;
      return [ux * cos - uy * sin, ux * sin + uy * cos];
    };
    const bottom = glass
      .slice()
      .reverse()
      .map((v) => {
        const [lx, ly] = local(v);
        return `${lx.toFixed(1)}px ${(behindGlass ? Math.min(ly, p.b) : p.b).toFixed(1)}px`;
      });
    const right = local(glass[glass.length - 1])[0];
    const left = local(glass[0])[0];
    return {
      transform: `translate(${(p.x - c.left).toFixed(1)}px, ${(p.y - c.top).toFixed(1)}px) rotate(${p.a.toFixed(5)}rad) scale(${p.k.toFixed(4)})`,
      clipPath: `polygon(${left.toFixed(1)}px ${-PAD - 5000}px, ${right.toFixed(1)}px ${-PAD - 5000}px, ${bottom.join(', ')})`,
    };
  };

  // Each stretch sampled with its own easing, so the cut stays on the glass the
  // whole way.
  const leg = (p: Pose, q: Pose, ease: (t: number) => number, steps: number, behindGlass: boolean) =>
    Array.from({ length: steps + 1 }, (_, i) => frame(lerp(p, q, ease(i / steps)), behindGlass));
  const timed = (legs: { frames: ReturnType<typeof frame>[]; share: number }[]) => {
    const out: (ReturnType<typeof frame> & { offset: number })[] = [];
    let start = 0;
    legs.forEach(({ frames, share }, li) => {
      frames.forEach((fr, i) => {
        if (li > 0 && i === 0) return; // the joint is the last leg's end
        out.push({ ...fr, offset: Math.min(1, start + (share * i) / (frames.length - 1)) });
      });
      start += share;
    });
    return out;
  };

  return {
    // Off the file and up, then out to full size.
    open: timed([
      { frames: leg(onFile, above, cubicBezier(0.2, 0, 0, 1), 10, true), share: 0.38 },
      { frames: leg(above, rest, cubicBezier(0.22, 1, 0.36, 1), 18, false), share: 0.62 },
    ]),
    // Down to the file's shape just above it, then onto it, behind the glass.
    close: timed([
      { frames: leg(rest, above, cubicBezier(0.4, 0, 0.2, 1), 18, false), share: 0.62 },
      { frames: leg(above, onFile, cubicBezier(0.5, 0, 0.9, 0.6), 10, true), share: 0.38 },
    ]),
  };
}

/** A CSS cubic-bezier easing as a function, for sampling a flight by hand. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  return (x: number) => {
    if (x <= 0 || x >= 1) return x;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (at(mid, x1, x2) < x) lo = mid;
      else hi = mid;
    }
    return at((lo + hi) / 2, y1, y2);
  };
}

type Flight = NonNullable<ReturnType<typeof pocketFlight>>;

/** Off the file, then up to full size. */
function flyOut(card: HTMLElement | null, path: Flight) {
  return card?.animate(path.open, { duration: 640 });
}

/** Down to the file's shape, then onto it. Resolves when it has landed. */
async function flyIn(card: HTMLElement | null, path: Flight) {
  await card?.animate(path.close, { duration: 620, fill: 'forwards' }).finished.catch(() => undefined);
}

/** The blur behind a reading card, faded rather than switched. */
function fadeBackdrop(dialog: HTMLDialogElement | null, from: number, to: number, duration: number) {
  try {
    dialog?.animate([{ opacity: from }, { opacity: to }], {
      duration,
      easing: 'ease-out',
      fill: 'forwards',
      pseudoElement: '::backdrop',
    });
  } catch {
    // a browser that cannot animate ::backdrop just shows it
  }
}

/** The folder catches the card: the file lifts a little and settles. */
function catchFile(file: HTMLElement | null | undefined) {
  file?.animate([{ translate: '0 0' }, { translate: '0 -9px' }, { translate: '0 0' }], {
    duration: 420,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    composite: 'add',
  });
}

export default function ServiceFolder({
  name,
  promise,
  closed,
  open: openContent,
  paperOpen,
  toggleLabel,
  files,
  tone = 'dark',
  blaze = false,
  delay = 0,
  photo,
  photoPosition,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [reading, setReading] = useState<number | null>(null);
  const filesId = useId();

  // Entrance: drawn finished, hidden only once we know it may animate.
  const mayAnimate = useEntrance();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!mayAnimate || seen) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true);
    let t = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        t = window.setTimeout(() => setSeen(true), delay);
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [mayAnimate, seen, delay]);

  // Measure the folder so both outlines fit the copy at whatever width it got.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const write = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The lean. Written straight to CSS variables on animation frames, never
  // through React state, and only for a mouse: a finger has no hover to lean on.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty('--sf-px', px.toFixed(3));
      el.style.setProperty('--sf-py', py.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      raf ||= requestAnimationFrame(write);
    };
    const leave = () => {
      px = 0;
      py = 0;
      raf ||= requestAnimationFrame(write);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // In the carousel, a folder that leaves the middle shuts behind it, so the row
  // never carries an open folder off to the side. At phone width it never fans
  // out at all: tapping it opens the whole folder in one reading card.
  const { dormant, compact } = useContext(SlotContext);
  const [paging, setPaging] = useState(false);
  useEffect(() => {
    if (dormant || compact) setOpen(false);
  }, [dormant, compact]);
  useEffect(() => {
    if (dormant) setPaging(false);
  }, [dormant]);

  // Closed files are out of the tab order and the accessibility tree.
  useEffect(() => {
    filesRef.current?.toggleAttribute('inert', !isOpen);
  }, [isOpen]);

  // Escape or a press anywhere else shuts the folder, unless a file is being read.
  useEffect(() => {
    if (!isOpen || reading !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [isOpen, reading]);

  // The whole front toggles, like the card it replaced, except presses on a
  // link or a file, which have jobs of their own.
  function onFrontClick(e: MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest('a, [data-sf-keep]')) return;
    if (compact) setPaging(true);
    else setOpen((o) => !o);
  }

  const backClip = size ? `path('${backPath(size.w, size.h)}')` : undefined;
  const frontClip = size ? `path('${frontPath(size.w, size.h - PEEK)}')` : undefined;

  return (
    <div
      ref={rootRef}
      className="sf-root"
      data-tone={tone}
      data-open={isOpen || undefined}
      data-pending={(mayAnimate && !seen) || undefined}
      style={{ paddingTop: HEAD } as CSSProperties}
    >
      <div ref={bodyRef} className="sf-tilt" style={{ paddingTop: PEEK }}>
        <div aria-hidden className="sf-shadow" />
        <div aria-hidden className="sf-back" style={{ clipPath: backClip }} />

        {/* The photograph, as a print tucked into the pocket in front of the
            files and held with a paper clip (A's pick of three, 2026-11-03). It
            was a band behind the tab first, and the glass left a 74px strip of
            it showing, which was not enough to tell what any photo was. The
            print hangs over the top edge of the glass rather than tucking
            behind it (A, 2026-11-03), so all of it shows; it lifts on hover and
            slides aside when the folder opens, so it never covers the files. */}
        {photo ? (
          <div aria-hidden className="sf-print">
            <Photo
              name={photo}
              position={photoPosition}
              sizes="200px"
              className="h-full w-full"
            />
            <svg className="sf-clip" viewBox="0 0 20 52" aria-hidden>
              <path d="M6 44V12a5 5 0 0 1 10 0v34a7 7 0 0 1-14 0V16" />
            </svg>
          </div>
        ) : null}

        <article className="sf-front" style={{ clipPath: frontClip }} onClick={onFrontClick}>
          <div aria-hidden className="sf-tint" />
          <div aria-hidden className="sf-spec" />
          {blaze ? <span aria-hidden className="sf-blaze" /> : null}

          <div className="sf-copy">
            <h3 className="sf-name text-xl font-bold tracking-title">{name}</h3>
            <p className="sf-promise mt-2 text-cta font-bold leading-snug">{promise}</p>

            <div className="sf-face mt-4">{closed}</div>

            {/* What opening adds, below the description rather than in place of
                it. Sharing one cell made every folder as tall as its open state
                and left a hole under the shut copy. Height animates on
                grid-template-rows, 0fr to 1fr, the same as the card it replaced. */}
            <div className="sf-more grid" aria-hidden={!isOpen}>
              <div className="overflow-hidden">
                <div className="sf-face pt-5">{openContent}</div>
              </div>
            </div>

            <button
              ref={toggleRef}
              type="button"
              // On a phone the button opens the reading card, a dialog.
              aria-expanded={compact ? undefined : isOpen}
              aria-controls={compact ? undefined : filesId}
              aria-haspopup={compact ? 'dialog' : undefined}
              className="sf-toggle mt-6 flex items-center gap-3 rounded-brand text-base font-bold"
            >
              {/* The FAQ's plus to minus. */}
              <span aria-hidden className="relative h-4 w-4 shrink-0">
                <span className="sf-glyph absolute left-0 top-[7px] h-[2px] w-4 rounded-brand" />
                <span className="sf-glyph sf-glyph-v absolute left-[7px] top-0 h-4 w-[2px] rounded-brand" />
              </span>
              {toggleLabel}
            </button>
          </div>
        </article>

        {/* After the front in the DOM so the files come next in tab order once
            the folder opens; z-index, not source order, keeps them behind the glass. */}
        <ul ref={filesRef} id={filesId} className="sf-files" aria-label={`${name}, what’s included`}>
          {files.map((file, i) => (
            <li key={file.name} className="contents">
              <button
                type="button"
                data-sf-keep
                data-sf-file={i}
                className="sf-sheet"
                style={
                  {
                    '--sf-slot': fanSlot(i, files.length),
                    '--sf-depth': files.length - 1 - i,
                    '--sf-jx': `${(jitter(file.name) * 10).toFixed(2)}px`,
                    '--sf-jr': `${(jitter(file.name + '~') * 3.2).toFixed(2)}deg`,
                    zIndex: i + 1,
                  } as CSSProperties
                }
                onClick={() => setReading(i)}
              >
                <span className="sf-sheet-head">
                  {/* Files are in the order the work happens; the number says so. */}
                  <span className="sf-sheet-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sf-sheet-name">{file.name}</span>
                  {file.meta ? <span className="sf-sheet-meta">{file.meta}</span> : null}
                </span>
                <span aria-hidden className="sf-lines">
                  <i style={{ width: '86%' }} />
                  <i style={{ width: '92%' }} />
                  <i style={{ width: '64%' }} />
                  <i style={{ width: '78%' }} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <FileReader
        folder={name}
        files={files}
        index={reading}
        tone={tone}
        onClose={() => setReading(null)}
        rootRef={rootRef}
      />

      <FolderPage
        shown={paging}
        onClose={() => {
          setPaging(false);
          toggleRef.current?.focus({ preventScroll: true });
        }}
        rootRef={rootRef}
        name={name}
        promise={promise}
        closed={closed}
        open={paperOpen ?? openContent}
        files={files}
        filesLabel={toggleLabel}
      />
    </div>
  );
}

/**
 * The whole folder in one reading card, for phones (A, 2026-11-20).
 *
 * On a phone the folder's front is already longer than the screen, and reading
 * the rest meant opening it, then each of three files in turn. Here a tap opens
 * one card with all of it, top to bottom: the name and promise, the description,
 * every file under its own number and name, and last the same closing words and
 * button the open folder ends on.
 *
 * It is made to match the computer's reading card, at A's request: white paper,
 * a little smaller than the screen, with the page blurred around it, so it still
 * reads as something pulled out of the folder. The card scrolls inside itself; close is pinned
 * to its top. It is always paper, whatever the folder's tone, so a dark folder's
 * button arrives here in its light-ground version (`paperOpen`).
 *
 * It is a modal `<dialog>`, like the file reader: focus is trapped, Escape
 * closes it, a tap on the blurred page closes it, and the page behind is inert.
 * Every word is the folder's existing copy.
 *
 * **It comes out of the folder's pocket and goes back into it** (A,
 * 2026-11-20). Opening, the card rises out of the pocket where the files peek
 * above the glass, file-sized, and grows to full size. Closing is the same in
 * reverse: it shrinks, evenly and still showing its words, to the size of a
 * file just above the pocket, then slips down into it, hidden from the glass's
 * edge down as it goes, and the top file in the folder gives a small bump as it
 * lands. The blur fades with it rather than switching off. The first version
 * blanked the card, squashed it onto the whole folder and vanished, which A
 * found harsh.
 *
 * The card draws above everything, so "behind the glass" is a clip at the
 * glass's top edge, not real layering. All of it is the Web Animations API, no
 * library, and none of it runs under prefers-reduced-motion.
 */
function FolderPage({
  shown,
  onClose,
  rootRef,
  name,
  promise,
  closed,
  open,
  files,
  filesLabel,
}: {
  shown: boolean;
  onClose: () => void;
  rootRef: RefObject<HTMLDivElement>;
  name: string;
  promise: string;
  closed: ReactNode;
  open: ReactNode;
  files: FolderFile[];
  filesLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const titleId = useId();

  /** The card's way in and out of the folder, onto its top file. */
  function flight() {
    const root = rootRef.current;
    const card = cardRef.current;
    const file = root?.querySelector<HTMLElement>('[data-sf-file="0"]');
    const front = root?.querySelector<HTMLElement>('.sf-front');
    const print = root?.querySelector<HTMLElement>('.sf-print') ?? null;
    return card && file && front ? pocketFlight(card, file, front, print) : null;
  }

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!shown || !dialog || dialog.open) return;
    dialog.showModal();
    // Focus goes to Close. Left to itself the browser focuses the first thing it
    // can, and a scrolling card counts, so the whole card took the focus ring.
    closeRef.current?.focus({ preventScroll: true });
    if (cardRef.current) cardRef.current.scrollTop = 0;
    if (reducedMotion()) return;
    const path = flight();
    if (!path) return;
    flyOut(cardRef.current, path);
    fadeBackdrop(dialog, 0, 1, 420);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  /** Back onto its file in the folder, then close. `now` skips the flight. */
  async function close(now = false) {
    const dialog = ref.current;
    if (!dialog || !dialog.open || closing.current) return;
    closing.current = true;
    const path = now || reducedMotion() ? null : flight();
    if (path) {
      fadeBackdrop(dialog, 1, 0, 600);
      await flyIn(cardRef.current, path);
    }
    dialog.close();
    // The card's flight and the blur's fade, ::backdrop included, so the next
    // opening starts clean.
    dialog.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    closing.current = false;
    onClose();
    // The folder catches it.
    if (path) catchFile(rootRef.current?.querySelector<HTMLElement>('[data-sf-file="0"]'));
  }

  return (
    <dialog
      ref={ref}
      className="sf-page"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // A tap on the blurred page lands on the dialog itself.
        if (e.target === ref.current) close();
      }}
      onClickCapture={(e) => {
        // A link to somewhere else on the page closes the card at once, or it
        // would scroll the site behind a card that still covers it.
        const link = (e.target as HTMLElement).closest('a');
        if (link && link.getAttribute('href')?.startsWith('#')) close(true);
      }}
    >
      <div ref={cardRef} className="sf-page-card">
        <div className="sf-page-inner">
          <div className="sf-page-bar">
            <p className="sf-page-kicker text-sm font-bold tracking-label">{filesLabel}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => close()}
              aria-label="Close"
              className="sf-page-close grid h-11 w-11 shrink-0 place-items-center rounded-brand"
            >
              <X aria-hidden className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          <div className="sf-page-body">
            <h2 id={titleId} className="sf-name text-2xl font-bold tracking-title">
              {name}
            </h2>
            <p className="sf-promise mt-2 text-cta font-bold leading-snug">{promise}</p>
            <div className="sf-face mt-5">{closed}</div>

            <ol className="mt-10 space-y-9">
              {files.map((file, i) => (
                <li key={file.name}>
                  <p className="sf-page-num text-sm font-bold tracking-label tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="sf-name mt-1 text-xl font-bold tracking-title">{file.name}</h3>
                  {file.meta ? <p className="sf-face mt-1 text-sm">{file.meta}</p> : null}
                  <div className="mt-4 space-y-4">
                    {file.blocks.map((block, k) =>
                      'p' in block ? (
                        <p key={k} className="sf-face text-base leading-body">
                          {block.p}
                        </p>
                      ) : (
                        <div key={k}>
                          {block.heading ? (
                            <p className="sf-name mb-3 text-base font-bold">{block.heading}</p>
                          ) : null}
                          <ul className="space-y-3">
                            {block.list.map((line) => (
                              <li key={line} className="sf-face flex gap-3 text-base leading-body">
                                <span
                                  aria-hidden
                                  className="sf-page-dash mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand"
                                />
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="sf-face sf-page-close-copy mt-10">{open}</div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/**
 * The reading card. One `<dialog>` per folder, opened modally so focus is
 * trapped, Escape closes it and the page behind is inert. It rises out of the
 * folder's pocket over the file that was clicked, and on close drops back into
 * the pocket behind the glass, the same flight as the phone's card (A,
 * 2026-11-20). It used to grow straight out of the file and shrink back onto it.
 */
function FileReader({
  folder,
  files,
  index,
  tone,
  onClose,
  rootRef,
}: {
  folder: string;
  files: FolderFile[];
  index: number | null;
  tone: 'dark' | 'light';
  onClose: () => void;
  rootRef: RefObject<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const titleId = useId();
  const [shown, setShown] = useState<number | null>(null);
  const file = shown === null ? null : files[shown];

  const sheet = (i: number) =>
    rootRef.current?.querySelector<HTMLElement>(`[data-sf-file="${i}"]`) ?? null;

  /** The card's way in and out of the folder, onto the file it is. The same
   *  flight as the phone's whole-folder card (pocketFlight). */
  function flight(i: number) {
    const card = cardRef.current;
    const file = sheet(i);
    const front = rootRef.current?.querySelector<HTMLElement>('.sf-front');
    const print = rootRef.current?.querySelector<HTMLElement>('.sf-print') ?? null;
    return card && file && front ? pocketFlight(card, file, front, print) : null;
  }

  useEffect(() => {
    if (index === null) return;
    setShown(index);
  }, [index]);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (shown === null || !dialog || dialog.open) return;
    dialog.showModal();
    // Off its file in the folder, as the file it is (A, 2026-11-20).
    const path = reducedMotion() ? null : flight(shown);
    if (path) {
      flyOut(cardRef.current, path);
      fadeBackdrop(dialog, 0, 1, 420);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  async function close() {
    const dialog = ref.current;
    if (!dialog || closing.current || shown === null) return;
    closing.current = true;
    // Back onto its file in the folder, as the file it is.
    const path = reducedMotion() ? null : flight(shown);
    if (path) {
      fadeBackdrop(dialog, 1, 0, 600);
      await flyIn(cardRef.current, path);
    }
    const back = sheet(shown);
    dialog.close();
    // The flight and the blur's fade, ::backdrop included, so the next opening
    // starts clean.
    dialog.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    if (path) catchFile(back);
    closing.current = false;
    setShown(null);
    onClose();
    back?.focus();
  }

  return (
    <dialog
      ref={ref}
      className="sf-reader"
      data-tone={tone}
      aria-labelledby={file ? titleId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog itself.
        if (e.target === ref.current) close();
      }}
    >
      <div ref={cardRef} className="sf-reader-card">
        {file ? (
          <div className="sf-reader-body">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-bold tracking-label text-slate">
                  {folder}
                  <span className="tabular-nums"> · {String((shown ?? 0) + 1).padStart(2, '0')}</span>
                </p>
                <h4 id={titleId} className="mt-1 text-xl font-bold tracking-title text-charcoal">
                  {file.name}
                </h4>
                {file.meta ? <p className="mt-1 text-sm text-slate">{file.meta}</p> : null}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-brand text-charcoal transition-colors duration-200 ease-state hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-charcoal"
              >
                <X aria-hidden className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {file.blocks.map((block, i) =>
                'p' in block ? (
                  <p key={i} className="text-base leading-body text-charcoal">
                    {block.p}
                  </p>
                ) : (
                  <div key={i}>
                    {block.heading ? (
                      <p className="mb-3 text-base font-bold text-charcoal">{block.heading}</p>
                    ) : null}
                    <ul className="space-y-3">
                      {block.list.map((line) => (
                        <li key={line} className="flex gap-3 text-base leading-body text-charcoal">
                          <span aria-hidden className="mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand bg-stone" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
