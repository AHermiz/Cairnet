'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Says whether an entrance animation may run right now.
 *
 * The problem this solves, reproduced rather than theorised. A Framer Motion
 * `initial={{ opacity: 0 }}` is written into the markup at render, and the
 * animation that clears it runs on animation frames. A document whose
 * `visibilityState` is `hidden` gets no animation frames at all, so the element
 * stays at opacity 0 for as long as that lasts. On this page that meant a hero
 * with a photograph and no words on it.
 *
 * So the resting state is the default and the animation is the enhancement:
 *
 * - Server render and first client render return `false`, which means every
 *   consumer draws its content in place. The HTML that ships is complete.
 * - A layout effect, which runs before the browser paints, flips it to `true`
 *   when the document is actually visible and the reader has not asked for
 *   reduced motion. Because it is a layout effect and not an effect, there is no
 *   frame where the finished state is visible before the animation takes over,
 *   so no flash.
 * - If the document starts hidden, it stays at rest and waits. The moment it
 *   becomes visible, the animation is allowed to run.
 *
 * The cost is one extra render on mount. The thing it buys is that no renderer
 * which skips animation, a background tab, a prerenderer, a scraper, ever sees
 * an empty page.
 */

// useLayoutEffect warns during server render. There is no layout on the server,
// so fall back to useEffect there and let the client do the real work.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useEntrance(): boolean {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduce) return;

    if (document.visibilityState === 'visible') {
      setReady(true);
      return;
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') setReady(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reduce]);

  return ready;
}
