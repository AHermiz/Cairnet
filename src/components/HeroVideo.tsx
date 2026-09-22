'use client';

import { useEffect, useState } from 'react';

/**
 * The hero loop, layered over the still.
 *
 * **The still is the hero, the video is an enhancement.** The photograph is the
 * LCP element on this page and it is 44 KB; the loop is 3.9 MB. If the video
 * were the thing the page renders, mobile would pay ninety times the bytes for
 * the first paint, which is the opposite of what this site is optimised for. So
 * the picture underneath always paints, and this mounts on top of it afterwards
 * and fades in once it can actually play. If it never loads, the hero is the
 * photograph and nothing is broken.
 *
 * Three gates before it loads a byte:
 *
 * - **Desktop only.** Below 768px the still is an art-directed portrait crop and
 *   the loop is 16:9, so it would have to be cropped hard to fit; more to the
 *   point, a 3.9 MB autoplaying background on a phone connection is a cost the
 *   reader did not ask for.
 * - **Reduced motion is respected.** CSS cannot stop a video autoplaying, so
 *   this is the one piece of motion on the page that needs JavaScript to honour
 *   the preference.
 * - **After the page is idle.** `requestIdleCallback` keeps the download off the
 *   critical path entirely, so it cannot compete with the LCP image for
 *   bandwidth. The 1.2s timeout is the fallback for Safari, which has no idle
 *   callback.
 *
 * The grade is duplicated from the `img` rather than shared, because the two
 * elements are siblings and there is nothing to inherit it from. If one changes
 * the other has to change with it or the fade will visibly shift colour.
 */
export default function HeroVideo({ src, className }: { src: string; className?: string }) {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const start = () => setMount(true);
    const ric = (window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;

    if (ric) {
      const id = ric(start, { timeout: 3000 });
      return () => (window as typeof window & { cancelIdleCallback?: (id: number) => void })
        .cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!mount) return null;

  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0 }}
      className={`transition-opacity duration-1000 ease-out ${className ?? ''}`}
    />
  );
}
