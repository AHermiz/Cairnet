'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
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

export default function CairnMark({
  ground = 'dark',
  className,
  animate = false,
  title = 'The Cairnet mark, four stacked stones',
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  // The stack has to land while somebody is looking at it. This mark sits at the
  // bottom of the page, so triggering on mount would mean it had finished
  // stacking minutes before the reader ever got there.
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const fills = ground === 'dark' ? tiers.dark : tiers.light;
  const play = animate && !reduce && inView;

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
      {mark.rects.map(([x, y, w, h], i) => {
        const stone = stoneTimeline[i];
        const isBlaze = i === mark.rects.length - 1;
        const physics = isBlaze ? bounce.blaze : bounce.stone;
        const tilt = isBlaze ? rock.blaze : rock.stone;

        if (!play) {
          return (
            <rect key={i} x={x} y={y} width={w} height={h} rx={mark.radius} fill={fills[i]} />
          );
        }

        // Drop height scales with the mark, not with the frame it happens in.
        const drop = markDrop;
        const fall = bounceKeyframes(drop, physics.restitution, physics.bounces);
        const tip = rockKeyframes(tilt.degrees, tilt.oscillations, tilt.decay);

        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={mark.radius}
            fill={fills[i]}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={{ y: -drop, rotate: 0, opacity: 0 }}
            animate={{ y: fall.values, rotate: tip.values, opacity: 1 }}
            transition={{
              y: {
                delay: stone.delay,
                duration: stone.duration,
                times: fall.times,
                ease: fall.easings,
              },
              rotate: {
                // A stone in the air does not rock. This starts on first contact.
                delay: stone.delay + stone.duration * fall.firstContact,
                duration: frames(tilt.durationFrames),
                times: tip.times,
                ease: 'linear',
              },
              opacity: { delay: stone.delay, duration: 0 },
            }}
          />
        );
      })}
    </svg>
  );
}
