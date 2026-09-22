/**
 * The mark's motion, factored out of CairnMark.
 *
 * The service cards briefly used these too, landing like the stones do. A asked
 * for that to go back to the plain reveal: the drop was not make-or-break and
 * Framer Motion's per-instance cost on the four most-repeated components on the
 * page was. `stoneCardDrop` went with it rather than being left to rot.
 */

import { dropFromMarkRatio, frames, mark } from './tokens';

/**
 * Where a falling thing is over time, as offsets from its resting place.
 * Negative is above. The fall accelerates, each hop decelerates on the way up
 * and accelerates on the way down, and hop heights fall off as restitution
 * squared.
 *
 * A stone bounces UP, never down. A spring overshoots below its resting place,
 * and with 7 units between stones any overshoot worth seeing is an overlap.
 */
export function bounceKeyframes(drop: number, restitution: number, hops: number) {
  // A ball dropped from h takes t to fall; a hop to e^2*h takes 2*e*t. Normalize.
  let span = 1;
  for (let i = 1; i <= hops; i += 1) span += 2 * restitution ** i;

  const values: number[] = [-drop];
  const times: number[] = [0];
  const easings: string[] = [];

  let t = 1 / span; // first contact
  values.push(0);
  times.push(t);
  easings.push('easeIn'); // falling

  for (let i = 1; i <= hops; i += 1) {
    const hop = drop * restitution ** (2 * i);
    const leg = restitution ** i / span; // up, then the same again down
    t += leg;
    values.push(-hop);
    times.push(t);
    easings.push('easeOut'); // rising
    t += leg;
    values.push(0);
    times.push(Math.min(t, 1));
    easings.push('easeIn'); // falling
  }

  return { values, times, easings, firstContact: 1 / span };
}

/**
 * The tilt as a stone settles: one edge lifts while the other drops, dying away.
 * Amplitude decays exponentially and is also multiplied by (1 - progress) so it
 * reaches exactly level. Exponential decay alone leaves a degree of tilt at the
 * end that snaps back.
 */
export function rockKeyframes(degrees: number, oscillations: number, decay: number, samples = 28) {
  const values: number[] = [];
  const times: number[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const p = i / samples;
    const amplitude = degrees * Math.exp(-decay * p) * (1 - p);
    values.push(amplitude * Math.cos(2 * Math.PI * oscillations * p));
    times.push(p);
  }
  values[values.length - 1] = 0;
  return { values, times };
}

export const markDrop = dropFromMarkRatio * mark.grid;

export { frames };
