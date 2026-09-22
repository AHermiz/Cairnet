import { services } from '@/lib/content';
import Reveal from './Reveal';
import ServiceGraphic from './ServiceGraphic';

/**
 * The four services. Charcoal ground, closing the dark block the hero opened.
 *
 * **Not four identical tiles.** Assessment is the front door, the other three are
 * what an assessment turns up, and the layout says so instead of leaving four
 * equal boxes for the reader to rank. It takes the tall left column at full
 * height; the other three stack beside it.
 *
 * **The front door card is inverted onto Off-White** rather than given a badge or
 * a highlight colour. The brand has exactly two grounds and this uses the second
 * one, so the emphasis costs nothing and invents nothing. It also lets the card
 * carry the Statement family's edge blaze, a short Signal bar at the height the
 * type begins, which is the one accent mark in this section. On Off-White Signal
 * measures 4.48:1, comfortably past the 3:1 a graphic needs; on the charcoal
 * cards it would have been 2.5:1 and unusable.
 *
 * **No CTA in this section.** The nav and the hero already carry the one label
 * this site uses to ask for the sale, and the close asks again. A fourth copy
 * here would be the same intent competing with itself, and it would spend a
 * second red on furniture.
 *
 * Body copy is Mist, never Stone. Stone is 4.72:1 on flat charcoal, which scrapes
 * past AA and reads as furniture, and on a raised surface it drops to 4.16:1 and
 * fails outright. Mist is 9.98:1 and is the tier that exists for this job.
 *
 * **The cards use `Reveal`, not the stone drop.** They briefly landed the way the
 * mark's stones do, on the four stones' own delays. A's call to take it out: it
 * was not a make-or-break piece of the page, and these are the most-repeated
 * components on it, so Framer Motion's per-instance cost was being paid four
 * times for a flourish. `StoneDrop` and `stoneCardDrop` were deleted rather than
 * left sitting unused.
 */
export default function Services() {
  const [frontDoor, ...rest] = services.items;

  return (
    <section id="services" className="bg-charcoal py-frame">
      <div className="frame">
        <Reveal>
          <div className="max-w-prose">
            <h2 className="text-3xl font-bold tracking-claim text-offwhite">{services.heading}</h2>
            <p className="mt-5 text-lg leading-body text-mist">{services.lede}</p>
          </div>
        </Reveal>

        <div className="mt-gutter grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          {/* Sticky, not stretched. The three cards beside it are taller than this
              one, and matching their height left a 350px hole inside the card.
              Pinning it instead keeps the column from going ragged, holds the
              front door on screen while the reader goes through what an
              assessment turns up, and means the card is only ever as tall as its
              own content. */}
          <Reveal index={0} className="lg:sticky lg:top-24 lg:self-start">
            <article className="relative flex flex-col overflow-hidden rounded-brand bg-offwhite">
              {/* The edge blaze. Statement family device, and the only red in
                  this section: it marks which of the four you start with. */}
              <span
                aria-hidden
                className="absolute left-0 top-[160px] z-10 h-16 w-[6px] rounded-r-brand bg-signal"
              />
              <ServiceGraphic
                service={0}
                ground="light"
                className="h-[120px] w-full bg-neutral-100"
              />
              <div className="flex flex-col p-8 sm:p-10">
              <h3 className="text-xl font-bold tracking-claim text-charcoal">{frontDoor.name}</h3>
              <p className="mt-2 text-cta font-bold leading-snug text-slate">{frontDoor.promise}</p>
              <p className="mt-5 text-base leading-body text-slate">{frontDoor.body}</p>

              {/* The three beats. This card is the tallest thing in the section
                  because it sets the height of the column beside it, so it has
                  to earn that height rather than stretch to fill it: the first
                  build left roughly 350px of nothing under the body copy. */}
              <ul className="mt-7 space-y-3 border-t border-neutral-200 pt-7">
                {services.frontDoorBeats.map((beat) => (
                  <li key={beat} className="flex gap-3 text-base leading-body text-charcoal">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand bg-stone"
                    />
                    {beat}
                  </li>
                ))}
              </ul>

              {/* Not "everything below": on desktop the other three sit beside
                  this card, not under it, so a directional line is wrong half
                  the time. This says the thing a buyer actually needs to know
                  before they book, and it is the same line the source copy
                  insists goes on the call and in the report. */}
              <p className="mt-7 text-sm font-bold text-charcoal">
                Implementation is quoted separately.
              </p>
              </div>
            </article>
          </Reveal>

          <div className="grid gap-6 lg:gap-8">
            {rest.map((item, i) => (
              <Reveal key={item.name} index={i + 1}>
                <article className="h-full overflow-hidden rounded-brand border border-border">
                  <ServiceGraphic
                    service={i + 1}
                    ground="dark"
                    className="h-[120px] w-full bg-surface"
                  />
                  <div className="p-7 sm:p-8">
                    <h3 className="text-xl font-bold tracking-claim text-offwhite">{item.name}</h3>
                    <p className="mt-2 text-cta font-bold leading-snug text-mist">{item.promise}</p>
                    <p className="mt-4 max-w-prose text-base leading-body text-mist">{item.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
