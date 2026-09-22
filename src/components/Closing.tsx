import { ArrowRight } from 'lucide-react';
import { CTA, EMAIL, MAILTO, closing } from '@/lib/content';
import CairnMark from './CairnMark';
import Reveal from './Reveal';

/**
 * The close. Charcoal ground, and the page's only centred composition.
 *
 * That is taken from the end card, which centres deliberately because it is a
 * sign-off rather than a content tile and should feel different from the frame
 * before it. Everything above this hangs off the left margin, so the switch is
 * the signal that the argument is over.
 *
 * **This is where the stones stack.** The mark performs itself here rather than
 * in the hero: the hero now carries a photograph of a finished cairn, and the
 * brand's rule is that the mark appears once per asset. Putting the performance
 * at the end also matches what it means. A cairn is built one stone at a time and
 * you reach the marker after the walk, not before it. Triggered on scroll rather
 * than on mount, so it lands while somebody is actually looking.
 *
 * Two reds, both earned: the mark's own blaze, and the button. The end card adds
 * a short Signal rule under its tagline, and it is left out here because the
 * button already does that job and three stacked accents in one viewport is the
 * ceiling rather than a target.
 */
export default function Closing() {
  return (
    <section className="bg-charcoal py-frame text-offwhite">
      <div className="frame flex flex-col items-center text-center">
        <Reveal>
          <CairnMark animate ground="dark" className="h-28 w-28 sm:h-32 sm:w-32" />
        </Reveal>

        <Reveal index={1}>
          <h2 className="mt-tight max-w-[18ch] text-balance text-3xl font-bold tracking-claim">
            {closing.heading}
          </h2>
        </Reveal>

        <Reveal index={2}>
          <p className="mt-6 max-w-[54ch] text-lg leading-body text-mist">{closing.body}</p>
        </Reveal>

        <Reveal index={3}>
          <div className="mt-gutter flex flex-col items-center gap-5">
            <a
              href={MAILTO}
              className="group inline-flex items-center gap-3 rounded-brand bg-signal py-1.5 pl-6 pr-1.5 text-cta font-bold text-offwhite transition-[gap,filter,transform] duration-200 ease-state hover:gap-4 hover:brightness-95 active:scale-[0.98]"
            >
              {CTA}
              <span className="flex h-11 w-11 items-center justify-center rounded-brand bg-charcoal transition-transform duration-200 ease-state group-hover:translate-x-0.5">
                <ArrowRight className="h-5 w-5 text-offwhite" strokeWidth={2} aria-hidden />
              </span>
            </a>

            <p className="text-base text-stone">
              or email{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-mist underline decoration-slate underline-offset-4 transition-colors duration-200 ease-state hover:text-offwhite hover:decoration-offwhite"
              >
                {EMAIL}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
