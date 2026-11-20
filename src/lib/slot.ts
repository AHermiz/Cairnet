import { createContext } from 'react';

/**
 * What a folder needs to know about the carousel slot it sits in.
 *
 * `dormant`: it is off to the side, not the one in the middle. A dormant folder
 * shuts itself, and the carousel makes it inert, so only the centred folder can
 * be opened or tabbed into.
 *
 * `compact`: the row is phone width. There a folder does not fan its files out;
 * tapping it opens one reading card with everything in it (A, 2026-11-20),
 * because reading a long folder file by file on a phone took too much swiping.
 *
 * Outside a carousel nothing provides this, so everything defaults to awake and
 * full width.
 */
export const SlotContext = createContext<{ dormant: boolean; compact: boolean }>({
  dormant: false,
  compact: false,
});
