'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ease, frames } from '@/lib/tokens';
import { CTA, MAILTO, hero } from '@/lib/content';
import CairnMark from './CairnMark';
import Button from './Button';

/**
 * The Statement family, as a page.
 *
 * Claim first, answer under it, and the answer is a clear step down in size. That
 * split is the brand's own: post 5 stopped trying to land "Most businesses don't
 * need AI" and "They need one specific thing fixed" on a single frame, because a
 * setup and a payoff were competing for the same moment.
 *
 * None of the type here animates, and that is deliberate. The headline is the
 * page's largest-contentful paint and its whole message, so gating it behind a
 * fade costs real LCP and shows an empty hero to any renderer that is not running
 * animation frames: a background tab, a link preview, a Lighthouse run. Motion
 * below the fold is scroll triggered, which already means someone is watching.
 *
 * The cairn carries the entrance instead. It is the brand's own metaphor performed
 * rather than described, and nothing is hidden if it never plays.
 *
 * Signal appears twice in this viewport and both marks carry the argument: on
 * "one specific thing", which is the claim, set large enough that Signal's 3.43:1
 * on charcoal is a large-text ratio rather than a body-text one, and on the button,
 * which is the payoff. The mark's own blaze is the third and last.
 */

const STONES_END = frames(42); // motion.endCard.stackEndFrame

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative bg-charcoal">
      <div className="frame grid items-center gap-6 pb-16 pt-10 sm:gap-tight lg:min-h-[78svh] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-gutter lg:pb-frame lg:pt-8">
        <div>
          <h1 className="font-bold tracking-claim text-offwhite">
            <span className="block text-balance text-display">{hero.claimSetup}</span>
            <span className="mt-4 block text-balance text-claim">
              {hero.claimPayoffLead}
              <span className="text-signal">{hero.claimAccent}</span>
              {hero.claimPayoffRest}
            </span>
          </h1>

          <p className="mt-tight max-w-[46ch] text-base leading-body text-mist">{hero.lede}</p>

          <div className="mt-tight flex flex-wrap items-center gap-4">
            <Button href={MAILTO}>{CTA}</Button>
            <Button href="#how-it-works" variant="ghost">
              See how it works
            </Button>
          </div>
        </div>

        {/* The mark is the hero image. The brand's illustration vocabulary is four
            flat stacked shapes, so this is the one picture the page needs, and the
            only one that could not have come from somewhere else. */}
        <div className="order-first flex justify-center lg:order-none lg:justify-end">
          <CairnMark
            animate
            ground="dark"
            className="h-28 w-28 sm:h-40 sm:w-40 lg:h-[min(24rem,28vw)] lg:w-[min(24rem,28vw)]"
            title="Four stones stacking into a cairn, the Cairnet mark"
          />
        </div>
      </div>

      {/* The ground the stack lands on. It draws in as the last stone settles, so
          the stones arrive on something rather than in front of nothing. */}
      <motion.div
        className="h-px origin-left bg-border"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : STONES_END, ease: ease.settle }}
      />
    </section>
  );
}
