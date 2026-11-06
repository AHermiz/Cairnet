'use client';

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';
import { mark } from '@/lib/tokens';
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
 *    inert page behind it for free, and the card grows out of the file's own
 *    position (FLIP on the Web Animations API, no animation library).
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

export default function ServiceFolder({
  name,
  promise,
  closed,
  open: openContent,
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
    setOpen((o) => !o);
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
              aria-expanded={isOpen}
              aria-controls={filesId}
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
    </div>
  );
}

/**
 * The reading card. One `<dialog>` per folder, opened modally so focus is
 * trapped, Escape closes it and the page behind is inert. It grows out of the
 * file that was clicked and shrinks back into it on close.
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

  /** The transform that puts the card exactly over the file it came from. */
  function fromSheet(i: number) {
    const s = sheet(i)?.getBoundingClientRect();
    const c = cardRef.current?.getBoundingClientRect();
    if (!s || !c || !c.width || !c.height) return null;
    return `translate(${s.left - c.left}px, ${s.top - c.top}px) scale(${s.width / c.width}, ${s.height / c.height})`;
  }

  useEffect(() => {
    if (index === null) return;
    setShown(index);
  }, [index]);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (shown === null || !dialog || dialog.open) return;
    dialog.showModal();
    const from = fromSheet(shown);
    if (from && !reducedMotion()) {
      cardRef.current?.animate(
        [
          { transform: from, borderRadius: '9px' },
          { transform: 'none', borderRadius: '9px' },
        ],
        { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      cardRef.current
        ?.querySelector('.sf-reader-body')
        ?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 180, fill: 'backwards' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  async function close() {
    const dialog = ref.current;
    if (!dialog || closing.current || shown === null) return;
    closing.current = true;
    const from = fromSheet(shown);
    if (from && !reducedMotion()) {
      const body = cardRef.current?.querySelector('.sf-reader-body');
      body?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' });
      await cardRef.current?.animate([{ transform: 'none' }, { transform: from }], {
        duration: 320,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }).finished.catch(() => undefined);
    }
    const back = sheet(shown);
    dialog.close();
    cardRef.current?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
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
