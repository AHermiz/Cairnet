import tokensJson from '../../tokens.json';

/**
 * The single read point for brand values in this app.
 *
 * tokens.json is a copy of projects/Cairnet/brand/tokens.json. Nothing else in
 * this repo may hold a colour, a typeface or a motion curve. The brand file's own
 * rule, and the reason it exists: the palette used to live in six build scripts
 * and the copies had started to disagree.
 */
export const tokens = tokensJson;

export const color = tokens.color.brand;
export const semantic = tokens.color.semantic;

/** The mark's four stones, base first, rising to the blaze. */
export const tiers = tokens.color.tiers;

/** Mark B's geometry on its own 200 unit grid. */
export const mark = tokens.mark;

const fps = tokens.motion.fps;

/** Frames at 30fps to seconds, because Framer Motion thinks in seconds. */
export const frames = (n: number) => n / fps;

/** Cubic beziers, straight off the token file. */
export const ease = {
  settle: tokens.motion.easing.settle as [number, number, number, number],
  state: tokens.motion.easing.stateChange as [number, number, number, number],
};

/**
 * The end card's stone timeline. The site's hero performs the same stack the
 * animated end card does: base, second, third, a beat, then the blaze.
 * Frame numbers come from motion.endCard.timeline so the two stay in step.
 */
type TimelineEntry = { element: string; startFrame: number; durationFrames: number };

export const stoneTimeline = (tokens.motion.endCard.timeline as TimelineEntry[])
  .filter((t) => t.element.startsWith('stone.'))
  .map((t) => ({
    name: t.element.replace('stone.', ''),
    delay: frames(t.startFrame),
    duration: frames(t.durationFrames),
  }));

export const bounce = tokens.motion.bounce;
export const rock = tokens.motion.rock;

/** How far above its resting place a stone starts, as a multiple of the mark's size. */
export const dropFromMarkRatio = tokens.motion.endCard.dropFromMarkRatio;
