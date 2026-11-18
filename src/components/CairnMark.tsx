'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mark, tiers, stoneTimeline, bounce, rock, frames } from '@/lib/tokens';
import { bounceKeyframes, rockKeyframes, markDrop } from '@/lib/motion';

/**
 * Mark B, performed.
 *
 * The end card animates the stones dropping in and stacking, base first, blaze
 * last. That is the brand's own metaphor acted out rather than described, and it
 * is the one piece of motion on this page that could not belong to anyone else.
 * The frame numbers, the drop height, the restitution and the rock all come out
 * of tokens.motion, so the hero and the end card stay the same performance.
 *
 * A stone bounces UP, never down. A spring overshoots below its resting place,
 * and with 7 units between stones any overshoot worth seeing is an overlap.
 *
 * **The browser's own animation API, not Framer Motion (2026-11-18).** This mark
 * was the last thing pulling the Framer bundle onto the home page: about 38 KB
 * gzipped, 26 KB of it unused on load. The motion is unchanged. Framer was being
 * asked for exactly two things, keyframes with a time per keyframe and an easing
 * per segment, and `Element.animate` takes both natively. `translate` and
 * `rotate` are separate CSS properties, so the drop and the rock keep their own
 * timelines the way they did when they were two Framer tracks.
 */

type Props = {
  /** 'dark' for the charcoal ground, 'light' for off-white. */
  ground?: 'dark' | 'light';
  className?: string;
  /** Play the stack. Off for the small static marks in the nav and footer. */
  animate?: boolean;
  title?: string;
};

const GRID = mark.grid;

// Framer's named eases, as the cubic beziers they stand for.
const EASE: Record<string, string> = {
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  linear: 'linear',
};

// useLayoutEffect warns during server render; there is nothing to lay out there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function CairnMark({
  ground = 'dark',
  className,
  animate = false,
  title = 'The Cairnet mark, four stacked stones',
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const stones = useRef<(SVGRectElement | null)[]>([]);
  // The stack has to land while somebody is looking at it. This mark sits at the
  // bottom of the page, so triggering on mount would mean it had finished
  // stacking minutes before the reader ever got there. Half the mark in view,
  // once. Never under prefers-reduced-motion: the stones simply sit there.
  const [play, setPlay] = useState(false);
  const fills = ground === 'dark' ? tiers.dark : tiers.light;

  useEffect(() => {
    if (!animate || play) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setPlay(true);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate, play]);

  // A layout effect, so the stones are already above the frame on the first
  // painted frame and there is no flash of the finished stack before it starts.
  useIsomorphicLayoutEffect(() => {
    if (!play) return;
    const running: Animation[] = [];

    mark.rects.forEach((_, i) => {
      const el = stones.current[i];
      if (!el || typeof el.animate !== 'function') return;

      const stone = stoneTimeline[i];
      const isBlaze = i === mark.rects.length - 1;
      const physics = isBlaze ? bounce.blaze : bounce.stone;
      const tilt = isBlaze ? rock.blaze : rock.stone;

      // Drop height scales with the mark, not with the frame it happens in.
      const fall = bounceKeyframes(markDrop, physics.restitution, physics.bounces);
      const tip = rockKeyframes(tilt.degrees, tilt.oscillations, tilt.decay);

      const delay = stone.delay * 1000;
      // `both`: hold the first keyframe through the delay, the last one after.
      const hold = { fill: 'both', easing: 'linear' } as const;

      // A stone is not there until it is released.
      running.push(
        el.animate([{ opacity: 0 }, { opacity: 1 }], { ...hold, delay, duration: 0 }),
      );

      running.push(
        el.animate(
          fall.values.map((v, k) => ({
            translate: `0 ${v}px`,
            offset: fall.times[k],
            easing: EASE[fall.easings[k]] ?? 'linear',
          })),
          { ...hold, delay, duration: stone.duration * 1000 },
        ),
      );

      // A stone in the air does not rock. This starts on first contact.
      running.push(
        el.animate(
          tip.values.map((v, k) => ({ rotate: `${v}deg`, offset: tip.times[k] })),
          {
            ...hold,
            delay: delay + stone.duration * 1000 * fall.firstContact,
            duration: frames(tilt.durationFrames) * 1000,
          },
        ),
      );
    });

    // Once everything has landed the resting attributes say the same thing the
    // last keyframes do, so let the animations go rather than hold them forever.
    Promise.all(running.map((a) => a.finished))
      .then(() => running.forEach((a) => a.cancel()))
      .catch(() => {});

    return () => running.forEach((a) => a.cancel());
  }, [play]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${GRID} ${GRID}`}
      className={className}
      role="img"
      aria-label={title}
      // The stones start above the frame and fall in, so the drawing has to be
      // allowed outside its own box while that happens.
      style={{ overflow: 'visible' }}
    >
      <title>{title}</title>
      {mark.rects.map(([x, y, w, h], i) => (
        <rect
          key={i}
          ref={(el) => {
            stones.current[i] = el;
          }}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={mark.radius}
          fill={fills[i]}
          // Rock about the stone's own centre, not the SVG's origin.
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}
    </svg>
  );
}
