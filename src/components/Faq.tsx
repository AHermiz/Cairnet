import { EMAIL, faq } from '@/lib/content';
import Reveal from './Reveal';

/**
 * Questions people ask first. Off-White ground, closing the light block.
 *
 * **Native `<details>`, not a JavaScript accordion.** Open and close, keyboard
 * support, the expanded state exposed to assistive tech, and find-in-page
 * reaching text inside a closed row all come free and all keep working with no
 * JS at all. A hand-rolled accordion has to earn every one of those back, and
 * the earlier sections on this page already proved how easy it is to ship one
 * with `aria-controls` pointing at nothing.
 *
 * The height animation is progressive enhancement on top, gated behind
 * `@supports` in globals.css. Browsers without `interpolate-size` open and close
 * instantly, which is exactly what `<details>` has always done.
 *
 * **No Signal anywhere in this section.** A marker on every row is six red marks
 * on one screen, which is the definition of chrome. The plus sign is built from
 * two rounded rects in the mark's own vocabulary and turns into a minus by
 * collapsing the vertical one.
 *
 * Rows run the full width of the frame rather than sitting in a column. Every
 * section above this one is built out of columns, and a long row is both a
 * different rhythm and the right shape for a question.
 */
export default function Faq() {
  return (
    <section id="questions" className="bg-offwhite py-frame text-charcoal">
      <div className="frame">
        <Reveal>
          <h2 className="max-w-prose text-3xl font-bold tracking-claim">{faq.heading}</h2>
        </Reveal>

        <div className="mt-gutter border-t border-neutral-200">
          {faq.items.map((item, i) => (
            <Reveal key={item.q} index={i} stagger={0.05}>
              <details className="faq-row group border-b border-neutral-200" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-gutter py-6 text-lg font-bold leading-snug transition-colors duration-200 ease-state hover:text-slate">
                  <span className="max-w-[54ch]">{item.q}</span>

                  {/* Plus to minus. Two rounded rects, the brand's one shape. */}
                  <span aria-hidden className="relative mt-1 h-4 w-4 shrink-0">
                    <span className="absolute left-0 top-[7px] h-[2px] w-4 rounded-brand bg-charcoal" />
                    <span className="faq-tick absolute left-[7px] top-0 h-4 w-[2px] rounded-brand bg-charcoal" />
                  </span>
                </summary>

                <div className="faq-body">
                  <p className="max-w-[68ch] pb-7 text-base leading-body text-slate">{item.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal index={6}>
          <p className="mt-tight text-base leading-body text-slate">
            Anything else, ask.{' '}
            <a
              href={`mailto:${EMAIL}`}
              className="font-bold text-charcoal underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-charcoal"
            >
              {EMAIL}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
