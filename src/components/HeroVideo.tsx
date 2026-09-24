'use client';

import { useEffect, useState } from 'react';

/**
 * The hero loop, layered over the still.
 *
 * **One source, at full resolution.** A previous version shipped two small
 * encodes, 960 for desktop and 640 for phones, on the reasoning that the hero is
 * graded down to 0.72 brightness under three scrims so compression would not
 * show. That reasoning was tested at `deviceScaleFactor: 1`, which is a display
 * nobody owns, and it was wrong twice over.
 *
 * Measured on real device pixel ratios:
 *
 *   phone,   DPR 3   640x356 upscaled 7.11x   (the still: 1.81x)
 *   desktop, DPR 2   960x536 upscaled 3.36x   (the still: 2.24x)
 *
 * The second mistake is the instructive one. A 16:9 clip inside a portrait hero
 * is scaled to cover by its HEIGHT, not its width: the phone box is 2532 device
 * pixels tall and the video is 356 pixels tall. Width was never the constraint,
 * so sizing against it produced a seventh-resolution hero that visibly fell off
 * the moment the video replaced the still.
 *
 * **The still is the hero, the video is an enhancement.** The photograph is the
 * LCP element on this page and it is 44 KB; the loop is 3.9 MB. If the video
 * were the thing the page renders, mobile would pay ninety times the bytes for
 * the first paint, which is the opposite of what this site is optimised for. So
 * the picture underneath always paints, and this mounts on top of it afterwards
 * and fades in once it can actually play. If it never loads, the hero is the
 * photograph and nothing is broken.
 *
 * One gate before it loads a byte:
 *
 * - **Reduced motion is respected.** CSS cannot stop a video autoplaying, so
 *   this is the one piece of motion on the page that needs JavaScript to honour
 *   the preference.
 *
 * **It ran on desktop only until A asked for the phone too.** The two reasons
 * for holding it back were real and both were judgement calls rather than
 * limits: 3.9 MB autoplaying on phone data is a cost the reader did not choose,
 * and the mobile still is an art-directed portrait crop while the loop is 16:9,
 * so the video has to be cropped hard to fill a portrait viewport. The crop is
 * handled by the same `object-position` the desktop still uses, which keeps the
 * cairn in frame because the stack sits at roughly 38% of the video's width. The
 * data cost stands and is A's to accept.
 *
 * **It used to wait for `requestIdleCallback` and no longer does.** The idea was
 * to keep the download off the critical path, and the cost was measured rather
 * than guessed: the request did not start until 2712ms, while the file itself
 * took 335ms to arrive. Nearly three seconds of a ten second loop went by before
 * anything moved, and the hero read as a still that twitched late. Mounting on
 * the first effect starts it around 500ms instead.
 *
 * The LCP image is 44 KB and carries `fetchPriority="high"`; the video is a
 * `<video>` element the browser schedules at low priority. On a slow connection
 * they do now share bandwidth, which is the trade being made deliberately: the
 * still is what paints either way, and if the loop arrives late it simply fades
 * in late.
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
    setMount(true);
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
