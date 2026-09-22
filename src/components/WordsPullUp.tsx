import { Fragment } from 'react';

/**
 * Word by word rise, from the 21st.dev reference A picked.
 *
 * Changes from the pasted version, each with a reason.
 *
 * 1. **Words are separated by a real space, not `marginRight`.** The original
 *    spaces them with margin, which looks correct and leaves the heading with no
 *    whitespace in it at all. A screen reader reads "Mostbusinessesdon'tneedAI"
 *    as a single word, and copying the headline gives you that too. Found on this
 *    page; it is in the reference.
 * 2. **The rise is CSS, so this is not a client component at all.** The original
 *    renders every word at opacity 0 and relies on animation frames to clear it.
 *    A document that is hidden gets no animation frames, so the heading never
 *    appears. That is not hypothetical: it happened here, and the hero rendered
 *    as a photograph with nothing on it. The JS fix that followed traded the bug
 *    for a slower one, because it could not start until React hydrated, so the
 *    heading was painted, withdrawn and re-revealed on a slow phone. A CSS
 *    animation starts at first paint and is time based, which fixes both. See the
 *    entrance block in globals.css.
 * 3. **The easing comes from `motion.easing.stateChange` in tokens.json** rather
 *    than a literal [0.16, 1, 0.3, 1]. The two are close but not identical, and a
 *    curve typed into a component is exactly the kind of brand value that drifts.
 *    It arrives here as `--ease-state`, set in globals.css from Tailwind's theme.
 * 4. **The asterisk prop is gone.** It marked a footnote Prisma has and this page
 *    does not, and an asterisk pointing at nothing is decoration.
 *
 * The one thing lost with the hook is that the words no longer wait to be
 * scrolled into view. That cost nothing: this only ever runs in the hero, which
 * is in view on load by definition.
 *
 * `segments` carry their own className so one line can hold two colours, which is
 * how "one specific thing" is set in Signal without splitting the sentence into
 * separate elements and losing the word rhythm.
 */

export type Segment = { text: string; className?: string };

type Props = {
  segments: Segment[];
  className?: string;
  /** Seconds before the first word. Lets a caller sequence several blocks. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
};

export default function WordsPullUp({
  segments,
  className = '',
  delay = 0,
  stagger = 0.075,
}: Props) {
  const words: Segment[] = [];
  segments.forEach((seg) => {
    seg.text.split(' ').forEach((word) => {
      if (word) words.push({ text: word, className: seg.className });
    });
  });

  return (
    <span className={`inline ${className}`}>
      {words.map((word, i) => (
        <Fragment key={`${word.text}-${i}`}>
          {i > 0 ? ' ' : null}
          <span
            className={word.className ? `rise-word ${word.className}` : 'rise-word'}
            // Rounded, because float addition puts 0.32499999999999996s in the
            // shipped markup otherwise.
            style={{ animationDelay: `${Math.round((delay + i * stagger) * 1000)}ms` }}
          >
            {word.text}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
