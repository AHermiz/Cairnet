import { ArrowRight } from 'lucide-react';
import HeroVideo from './HeroVideo';
import { CTA, MAILTO, hero } from '@/lib/content';
import WordsPullUp from './WordsPullUp';

/**
 * The 21st.dev PrismaHero structure, matched to Cairnet.
 *
 * What was kept: full bleed media behind everything, grain, a gradient that gets
 * heavier toward the bottom, content pinned to the floor on a 12 column grid,
 * the giant statement on the left and a narrow support column on the right, the
 * word by word rise, and the pill button with an arrow chip.
 *
 * What was changed, and why:
 *
 * - **Pills became the brand radius.** Everything round in the reference is
 *   `rounded-full`. Cairnet's shape rule is 9px, never a pill and never square,
 *   derived from the mark's own corner radius over its grid.
 * - **`bg-primary` and `text-primary` became real tokens.** They resolve to
 *   nothing in this project, and a landing page rendering an unstyled button is
 *   the usual way that goes unnoticed.
 * - **`h-screen` became `min-h-[100svh]`.** `h-screen` jumps when the iOS address
 *   bar collapses.
 * - **The centred pill navbar was dropped.** It is decorative and non sticky, and
 *   this page is long enough to need the real sticky nav. The nav now floats over
 *   the media instead, which is the same look with working navigation.
 * - **The vector mark is not in this hero.** The photograph is the cairn now, and
 *   the brand rule is that the mark appears once per asset. It is in the nav.
 *   The cost is real and worth naming: this variant trades the stones stacking
 *   themselves, which is the one piece of motion nobody else could have made,
 *   for a photograph of the finished thing.
 * - **The photograph is desaturated almost to grey.** As shot it is green and
 *   teal, which fights a palette built on charcoal, stone and off-white. Dropping
 *   the chroma also leaves Signal as the only colour on the screen, so the CTA
 *   and the one red phrase carry all of it.
 *
 * The giant line is the claim rather than the company name. Prisma can set its
 * own name at 20vw because you already know what Prisma is by the time you care.
 * A page for a business with no clients yet has to lead with the argument.
 *
 * **The reveal does not gate the copy, and it is not JavaScript.** The first
 * build of this hero rendered as a photograph with no words on it, because the
 * browser was reporting the document as hidden and nothing was getting animation
 * frames. The fix at the time was `useEntrance`, which held the copy at rest
 * until animating was safe. That removed the blank hero and replaced it with a
 * slower fault: a JS animation cannot start until React hydrates, and this is a
 * static export, so on a throttled phone the finished hero was painted, then
 * withdrawn to opacity 0 when Framer mounted, then faded back in. Largest
 * contentful paint was 3.5s and all of it was render delay.
 *
 * The rise is a CSS animation now. It starts at first paint, it is time based so
 * it finishes in a hidden tab rather than stalling, and it costs no main thread
 * work at all, which is why there is no `use client` on this file. The motion is
 * unchanged. See the entrance block in globals.css.
 */

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-charcoal">
      {/* Media. Generated rather than photographed, and self hosted so the first
          paint does not wait on a third party. Art directed: the portrait crop
          below 768px is centred on the cairn rather than on the frame, because a
          centre crop of a 16:9 source cuts the stack in half on a phone.

          The grade is deliberately lighter than the photograph it replaced,
          saturate 0.55 rather than 0.12. Heavy desaturation put it in palette and
          killed the miniature quality that is the whole point of the reference.
          This keeps the raking light and still leaves Signal as the only
          saturated colour on the screen. See media/CREDITS.md. */}
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/media/hero-cairn-portrait-900.webp"
          width={900}
          height={1400}
        />
        <source
          srcSet="/media/hero-cairn-960.webp 960w, /media/hero-cairn-1600.webp 1600w, /media/hero-cairn-2400.webp 2400w"
          sizes="100vw"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/hero-cairn-1600.webp"
          alt="A hand-stacked stone cairn on a clifftop plateau high above a sea of cloud, with a single walker beside it for scale"
          width={1600}
          height={1000}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[35%_center] [filter:saturate(0.55)_contrast(1.02)_brightness(0.72)]"
        />
      </picture>

      {/* The loop, over the still. See HeroVideo for why it is an enhancement
          rather than the hero itself. Same grade as the image above, same crop
          origin, so the fade from one to the other is invisible. */}
      <HeroVideo
        src="/media/hero-loop-1928.mp4"
        className="absolute inset-0 h-full w-full object-cover object-[35%_center] [filter:saturate(0.55)_contrast(1.02)_brightness(0.72)]"
      />

      {/* Mist. See globals.css for why this is weather and not a ken-burns pan. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="mist-a absolute -inset-x-[14%] inset-y-0"
          style={{
            background:
              'radial-gradient(52% 42% at 38% 34%, rgba(245,243,239,0.17), rgba(245,243,239,0) 72%)',
          }}
        />
        <div
          className="mist-b absolute -inset-x-[14%] inset-y-0"
          style={{
            background:
              'radial-gradient(48% 36% at 66% 50%, rgba(245,243,239,0.11), rgba(245,243,239,0) 70%)',
          }}
        />
      </div>

      {/* Grain. Fixed to this layer and pointer-events-none: a noise filter on a
          scrolling container repaints every frame and destroys mobile framerate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Scrim. Heavy at the floor where the type sits, and present at the top so
          the nav stays readable against the sky.

          The last stop is fully opaque charcoal, not 0.94. At 0.94 the very
          bottom of the photograph was still faintly visible and then cut hard to
          the flat charcoal of the section below, which read as a seam across the
          page. Landing on exactly the next section's background means there is
          nothing to see at the join. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(28,28,30,0.72) 0%, rgba(28,28,30,0.30) 26%, rgba(28,28,30,0.55) 62%, rgba(28,28,30,0.93) 86%, rgba(28,28,30,1) 100%)',
        }}
      />

      {/* A third scrim, bottom up, phones only.
          The portrait crop is a brighter part of the frame and there is no
          right-hand scrim below lg, so the lede measured 4.2:1 there against a
          4.5 floor for body text. This is the only failure the lighter grade
          introduced and it was invisible on desktop, which is the argument for
          measuring both. Takes it to about 5.6. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(to top, rgba(28,28,30,0.42) 0%, rgba(28,28,30,0) 58%)',
        }}
      />

      {/* A second scrim from the right. The photograph's brightest region is the
          sky, which sits exactly where the support column goes, and it was the
          worst ground on the page. This lifts Off-White there from 7.4:1 to
          10.2:1 and Mist from 6.2:1 to 7.5:1, measured against the composited
          pixels rather than assumed. It also separates the column from the
          picture, which the composition wanted anyway. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to left, rgba(28,28,30,0.85) 0%, rgba(28,28,30,0.60) 30%, rgba(28,28,30,0) 62%)',
        }}
      />

      {/* Content, on the floor, but lifted off it.
          Pinning straight to the bottom put roughly 256px of empty space above
          the content and 78px below on a 1512x745 window, which reads as
          everything having fallen to the floor rather than as a composition. The
          two spacers split the leftover height 3:1, so the block stays clearly
          bottom weighted like the reference and still has room underneath it at
          any viewport height. No magic pixel values: the ratio does the work. */}
      <div className="relative flex min-h-[100svh] flex-col pb-14 pt-28 sm:pb-16 lg:pb-frame">
        <div aria-hidden className="grow-[3]" />
        {/* gap-x only at lg. A 12 column grid applies the column gap between all
            twelve tracks whatever a child spans, so `gap-x-gutter` was demanding
            11 x 60px of gutter and forcing a 660px minimum width. Below lg every
            child is col-span-12 anyway, so there is nothing for a column gap to
            separate. */}
        <div className="frame grid grid-cols-12 items-end gap-x-0 gap-y-8 lg:gap-x-gutter">
          <h1 className="col-span-12 lg:col-span-7">
            <span className="block text-[clamp(2.5rem,5.4vw,4.5rem)] font-bold leading-[1.02] tracking-claim text-offwhite">
              <WordsPullUp segments={[{ text: hero.claimSetup }]} delay={0.1} />
            </span>
          </h1>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-5 lg:pb-2">
            {/* No Signal in this line, and the reason is measured rather than
                felt. Over the composited photograph Signal reaches 1.7:1 here,
                and pushing the scrim to 0.96 alpha, which erases the picture,
                still only gets it to 2.9:1, under the 3.0 floor for large text.
                Signal's ceiling on flat charcoal is 3.43:1, so a photographic
                ground can only ever approach that and never clear it.
                The emphasis survives by inverting the pair instead: the claim is
                Off-White and the words around it are Mist, which keeps weight
                binary inside the sentence the way the Statement carousels do.
                Signal is still on this screen, on the button, where it sits on a
                solid fill it controls. */}
            <p className="text-claim font-bold leading-claim tracking-claim text-offwhite">
              <WordsPullUp
                delay={0.5}
                segments={[
                  { text: hero.claimPayoffLead.trim(), className: 'text-mist' },
                  { text: hero.claimAccent },
                  { text: hero.claimPayoffRest.trim(), className: 'text-mist' },
                ]}
              />
            </p>

            <p
              className="rise max-w-[42ch] text-base leading-body text-mist"
              style={{ animationDelay: '1.05s' }}
            >
              {hero.lede}
            </p>

            <div
              className="rise flex flex-wrap items-center gap-4"
              style={{ animationDelay: '1.2s' }}
            >
              <a
                href={MAILTO}
                className="group inline-flex items-center gap-3 rounded-brand bg-signal py-1.5 pl-6 pr-1.5 text-cta font-bold text-offwhite transition-[gap,filter,transform] duration-200 ease-state hover:gap-4 hover:brightness-95 active:scale-[0.98]"
              >
                {CTA}
                <span className="flex h-11 w-11 items-center justify-center rounded-brand bg-charcoal transition-transform duration-200 ease-state group-hover:translate-x-0.5">
                  <ArrowRight className="h-5 w-5 text-offwhite" strokeWidth={2} aria-hidden />
                </span>
              </a>

              <a
                href="#how-it-works"
                className="rounded-brand border border-stone px-5 py-3.5 text-cta font-bold text-offwhite transition-[border-color,background-color,transform] duration-200 ease-state hover:border-offwhite hover:bg-charcoal/50 active:scale-[0.98]"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="grow" />
      </div>
    </section>
  );
}
