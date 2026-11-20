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
 *    pocket and drops back into it (pocketFlight, Web Animations API, no
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
 * Where the card hovers, file-sized, just above the folder's pocket over the
 * file it belongs to, and where it ends, down inside the pocket. Each comes with
 * the clip that hides whatever of the card is below the glass's top edge by then:
 * the card draws above everything, so "behind the glass" is a clip at that edge,
 * not real layering. Measured against the card at rest, so call it while the
 * card has no transform. The card's transform-origin must be its top left.
 */
function pocketFlight(card: HTMLElement, file: HTMLElement, front: HTMLElement) {
  const c = card.getBoundingClientRect();
  const s = file.getBoundingClientRect();
  const f = front.getBoundingClientRect();
  if (!c.width || !c.height || !s.width) return null;

  const glass = f.top + 32; // the glass front's top edge, below its tab
  // File-sized and fully above the pocket while it hovers: no wider than the
  // file, and short enough to sit in the room above the glass. An even scale,
  // so the card shrinks and never squashes.
  const room = Math.max(110, Math.min(260, glass - 24));
  const k = Math.min(s.width / c.width, room / c.height);
  const w = c.width * k;
  const h = c.height * k;
  const left = s.left + (s.width - w) / 2;
  const GAP = 6; // how far above the glass it hovers, and below it it ends
  const hoverTop = glass - GAP - h;
  const endTop = glass + GAP;
  const PAD = 80; // keeps the card's shadow inside the clip at rest
  const at = (top: number) =>
    `translate(${(left - c.left).toFixed(1)}px, ${(top - c.top).toFixed(1)}px) scale(${k.toFixed(4)})`;
  // The clip's bottom edge sits on the glass line: everything of the card below
  // it, in the card's own pixels, is hidden. Hovering, that is only the shadow;
  // inside, it is all of it. Between the two the card moves straight down at
  // one scale, so the cut stays exactly on the glass the whole way.
  const onGlass = (top: number) => c.height - (glass - top) / k;
  const clip = (bottom: number) => `inset(${-PAD}px ${-PAD}px ${bottom.toFixed(1)}px ${-PAD}px)`;

  return {
    rest: clip(-PAD),
    hover: { transform: at(hoverTop), clipPath: clip(onGlass(hoverTop)) },
    inside: { transform: at(endTop), clipPath: clip(onGlass(endTop)) },
  };
}

type Flight = NonNullable<ReturnType<typeof pocketFlight>>;

/** Out of the pocket, then up to full size. */
function flyOut(card: HTMLElement | null, path: Flight) {
  return card?.animate(
    [
      { ...path.inside, offset: 0, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      { ...path.hover, offset: 0.38, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      { transform: 'none', clipPath: path.rest, offset: 1 },
    ],
    { duration: 640 },
  );
}

/** Down to file size, then into the pocket. Resolves when it is inside. */
async function flyIn(card: HTMLElement | null, path: Flight) {
  await card
    ?.animate(
      [
        { transform: 'none', clipPath: path.rest, offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { ...path.hover, offset: 0.62, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
        { ...path.inside, offset: 1 },
      ],
      { duration: 620, fill: 'forwards' },
    )
    .finished.catch(() => undefined);
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

  /** The card's way in and out of the folder's pocket, over its top file. */
  function flight() {
    const root = rootRef.current;
    const card = cardRef.current;
    const file = root?.querySelector<HTMLElement>('[data-sf-file="0"]');
    const front = root?.querySelector<HTMLElement>('.sf-front');
    return card && file && front ? pocketFlight(card, file, front) : null;
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

  /** Back into the pocket, then close. `now` skips the flight. */
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

  /** The card's way in and out of the folder's pocket, over the file it is.
   *  The same flight as the phone's whole-folder card (pocketFlight). */
  function flight(i: number) {
    const card = cardRef.current;
    const file = sheet(i);
    const front = rootRef.current?.querySelector<HTMLElement>('.sf-front');
    return card && file && front ? pocketFlight(card, file, front) : null;
  }

  useEffect(() => {
    if (index === null) return;
    setShown(index);
  }, [index]);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (shown === null || !dialog || dialog.open) return;
    dialog.showModal();
    // Out of the folder's pocket, as the file it is (A, 2026-11-20).
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
    // Back into the pocket, as the file it is.
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
