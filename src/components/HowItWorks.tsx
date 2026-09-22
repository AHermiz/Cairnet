'use client';

import { howItWorks } from '@/lib/content';
import {
  ProgressSlider,
  SliderBtn,
  SliderBtnGroup,
  SliderContent,
  SliderWrapper,
} from './ProgressSlider';
import Reveal from './Reveal';
import StepGraphic from './StepGraphic';

/**
 * How an assessment runs. Off-White ground, the Teaching family.
 *
 * The slider carries the four steps because they are a sequence, and a bar
 * filling left to right across a rail of four is the one place on this page where
 * a progress device is describing what it actually is. Numbers earn their place
 * here for the same reason: this is a real ordered process, not a section that
 * wanted a decoration.
 *
 * **What is deliberately not in the slider.** The Teaching family's job is that a
 * reader can check the claim, so the report contents sit underneath as a plain
 * list, always visible, never rotating. The rail also shows all four step titles
 * at once, so the structure of the process is never hidden; only the paragraph
 * for one step at a time is. That was the condition for using a rotating
 * component in a section whose whole point is that nothing is hidden from you.
 *
 * Inactive tabs are Slate, not charcoal at 50% opacity as the reference does it.
 * Charcoal at half alpha over Off-White composites to roughly Stone, which
 * measures 3.26:1 and fails AA for body text. Slate is 7.51:1 and is the only
 * muted tier this ground has.
 */
export default function HowItWorks() {
  const steps = howItWorks.steps;

  return (
    <section id="how-it-works" className="bg-offwhite py-frame text-charcoal">
      <div className="frame">
        <Reveal>
          <div className="max-w-prose">
            <h2 className="text-3xl font-bold tracking-claim">{howItWorks.heading}</h2>
            <p className="mt-5 text-lg leading-body text-slate">{howItWorks.lede}</p>
            <p className="mt-4 text-lg font-bold leading-body text-charcoal">{howItWorks.note}</p>
          </div>
        </Reveal>

        {/* The slider is a desktop affordance and it is gated to md and up.
            Below that the rail collapses to one column, which put roughly 500px
            of step titles between the reader and any detail, and a pane that
            rotates on its own is the wrong thing to hand someone on a phone.
            Mobile gets all four steps open, which is what the Teaching family
            does natively anyway. Both use `display: none`, so only one of them is
            ever in the accessibility tree; the copy is not read twice. */}
        <Reveal index={1} className="mt-gutter hidden md:block">
          <ProgressSlider activeSlider={steps[0].title} label="How an assessment runs">
            <SliderBtnGroup
              label="The four steps"
              className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {steps.map((step, i) => (
                <SliderBtn
                  key={step.title}
                  value={step.title}
                  trackClass="h-[2px] w-full bg-neutral-200"
                  progressBarClass="h-[2px] w-full bg-signal"
                  // The tab is a tinted card as well, so the rail and the pane
                  // below it read as one component rather than four labels
                  // floating over an off-white field. `overflow-hidden` is what
                  // makes the progress bar clip to the rounded corners: it is
                  // absolutely positioned at top-0 and would otherwise run past
                  // them and square the card off at the top.
                  className="group overflow-hidden rounded-brand bg-neutral-100 p-5 pt-6 transition-colors duration-200 ease-state"
                >
                  <span className="block text-sm font-bold tabular-nums text-stone">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Two lines of room whether the title needs them or not, so the
                      meta lines under all four steps sit on one baseline. Step 02
                      wraps and the other three do not, and without this the rail
                      reads as three aligned items and one that slipped.
                      58px, not 52px: leading-snug on 21px is 28.875px a line, so
                      two lines need 57.75. The first guess left step 02 sitting
                      3px low, which is exactly the kind of thing that looks like
                      nothing in a screenshot and wrong on a real screen. */}
                  <span className="mt-1 block text-lg font-bold leading-snug text-slate transition-colors duration-200 ease-state group-aria-selected:text-charcoal sm:min-h-[3.625rem]">
                    {step.title}
                  </span>
                  {step.meta ? (
                    <span className="mt-1 block text-sm text-slate">{step.meta}</span>
                  ) : null}
                </SliderBtn>
              ))}
            </SliderBtnGroup>

            {/* The pane block is as tall as the longest step so the height never
                jumps between slides. The cost is empty space under the shorter
                ones: at 27px the worst case was 119px of nothing, which read as a
                hole. Dropping to 21px and widening the measure to 62ch closes most
                of it, and 21px is the right size for this copy anyway.

                Each pane sits on a tinted card, the same warm neutral the
                Assessment card's graphic band uses. This section and the FAQ under
                it are both long runs of type on the same off-white, and the tint
                is enough to break that up without introducing a colour. The rail
                above carries the same tint, deliberately, so the tabs and the pane
                read as one component rather than four labels floating over an
                off-white field. The reason sits on the tab's own className. */}
            <SliderContent className="mt-10">
              {steps.map((step, i) => (
                <SliderWrapper key={step.title} value={step.title}>
                  <div className="grid items-center gap-gutter rounded-brand bg-neutral-100 p-8 sm:p-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                    <p className="max-w-[54ch] text-lg leading-body text-charcoal">{step.body}</p>
                    <StepGraphic step={i} className="h-auto w-full max-w-[360px] justify-self-end" />
                  </div>
                </SliderWrapper>
              ))}
            </SliderContent>
          </ProgressSlider>
        </Reveal>

        {/* The phone gets the same four steps as cards rather than as a ruled
            list. It used to be plain rows divided by hairlines, with no graphic
            and no tint, so the desktop slider had four illustrations and a warm
            panel and the phone had neither. Mobile is the priority on this site,
            so that gap was the wrong way round.

            The rule survives as the card edge instead of a border, and the step
            graphics come across as they are: they are drawn on the light tier
            set, which is what this tint belongs to, so they need no second variant. */}
        <ol className="mt-gutter space-y-6 md:hidden">
          {steps.map((step, i) => (
            // An ol may only contain li, so the Reveal wrapper goes inside it
            // rather than around it.
            <li key={step.title}>
              <Reveal index={i}>
                <div className="rounded-brand bg-neutral-100 p-6">
                  <span className="block text-sm font-bold tabular-nums text-stone">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-lg font-bold leading-snug text-charcoal">{step.title}</h3>
                  {step.meta ? <p className="mt-1 text-sm text-slate">{step.meta}</p> : null}
                  <p className="mt-3 text-base leading-body text-charcoal">{step.body}</p>
                  <StepGraphic step={i} className="mx-auto mt-6 h-auto w-full max-w-[280px]" />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* The working, always visible.
            Stacked rather than side by side, on A's call: heading, then the list
            running the full width, then the note. Side by side made the list a
            narrow column with a short paragraph staring at it across a 60px
            gutter, and the rows were breaking to two lines for no reason.

            The note sits under the list rather than over it. It argues that you
            could run the report yourself and that doing so is a second job,
            which only lands once you have read what is actually in the report.
            Above the list it was answering a question nobody had been asked. */}
        <Reveal index={2} className="mt-frame">
          <h3 className="max-w-prose text-xl font-bold tracking-claim">
            {howItWorks.reportHeading}
          </h3>

          <ul className="mt-tight divide-y divide-neutral-200 border-y border-neutral-200">
            {howItWorks.report.map((line) => (
              <li key={line} className="py-5 text-lg leading-body text-charcoal">
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-tight max-w-prose text-base leading-body text-slate">
            {howItWorks.reportNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
