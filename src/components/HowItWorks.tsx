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
import Photo from './Photo';
import './HowItWorks.css';

/** One photograph per step, in step order. Sources in public/media/CREDITS.md. */
const stepPhotos = [
  { name: 'step-01-conversation', position: 'center 40%' },
  { name: 'step-02-research', position: 'center 60%' },
  { name: 'step-03-report', position: 'center' },
  { name: 'step-04-walkthrough', position: 'center 35%' },
];

/**
 * How an assessment runs. Charcoal ground since 2026-11-02 (A's call, the whole
 * homepage went charcoal), the Teaching family.
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
 * **Rebuilt closer to the reference (A, 2026-11-03).** The reference is
 * uilayout's Progressive Carousel on 21st.dev: one large photograph per step,
 * the step buttons laid across its bottom edge, and the active button filled by
 * its own progress. The first build kept only the rail, because the brand had no
 * photographs and flat drawings in a side pane were what it could fill a slide
 * with. Photography is in now, so the stage is back: the step's photo fills it,
 * slowly pushing in while it holds, and the step's paragraph sits on the photo
 * over a charcoal gradient dense enough for Off-White body type.
 *
 * Two departures from the reference, both brand: its pill labels are the
 * brand's one corner radius instead (never a pill), and its white-on-grey tiles
 * are frosted charcoal over the photo, with the active tile going Off-White and
 * its progress sweeping across it in Mist.
 */
export default function HowItWorks() {
  const steps = howItWorks.steps;

  return (
    <section id="how-it-works" className="bg-charcoal py-frame text-offwhite">
      <div className="frame">
        <Reveal>
          <div className="max-w-prose">
            <h2 className="text-3xl font-bold tracking-claim">{howItWorks.heading}</h2>
            <p className="mt-5 text-lg leading-body text-mist">{howItWorks.lede}</p>
            <p className="mt-4 text-lg font-bold leading-body text-offwhite">{howItWorks.note}</p>
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
          <ProgressSlider
            activeSlider={steps[0].title}
            label="How an assessment runs"
            className="relative aspect-[4/3] overflow-hidden rounded-brand bg-surface lg:aspect-[16/9]"
          >
            {/* Every slide sits in one cell of the stage and crossfades; the
                photo and its gradient fill it, and the paragraph sits above the
                button rail, whose height is the one fixed number here. */}
            <SliderContent className="absolute inset-0">
              {steps.map((step, i) => (
                <SliderWrapper key={step.title} value={step.title} className="hiw-slide relative h-full">
                  <div className="hiw-photo absolute inset-0">
                    <Photo
                      name={stepPhotos[i].name}
                      position={stepPhotos[i].position}
                      sizes="(min-width: 1280px) 1180px, 100vw"
                      large
                      className="h-full w-full"
                    />
                  </div>
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/75 via-45% to-transparent to-80%"
                  />
                  <p className="hiw-body absolute bottom-[9.5rem] left-0 max-w-[52ch] px-8 pb-8 text-lg leading-body text-offwhite lg:px-10">
                    {step.body}
                  </p>
                </SliderWrapper>
              ))}
            </SliderContent>

            <SliderBtnGroup
              label="The four steps"
              className="absolute inset-x-0 bottom-0 z-10 grid h-[9.5rem] grid-cols-4"
            >
              {steps.map((step, i) => (
                <SliderBtn
                  key={step.title}
                  value={step.title}
                  trackClass="hidden"
                  progressBarClass="h-full w-full bg-mist"
                  className="hiw-btn group overflow-hidden border-l border-white/10 bg-charcoal/70 px-5 py-5 backdrop-blur-md first:border-l-0 hover:bg-charcoal/55 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-offwhite aria-selected:bg-offwhite aria-selected:hover:bg-offwhite lg:px-6"
                >
                  <span className="relative z-10 flex h-full flex-col">
                    <span className="self-start rounded-brand bg-white/10 px-2.5 py-1 text-sm font-bold tabular-nums tracking-label text-offwhite group-aria-selected:bg-charcoal">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-2.5 block text-[0.9375rem] font-bold leading-snug text-offwhite group-aria-selected:text-charcoal lg:text-base">
                      {step.title}
                    </span>
                    {step.meta ? (
                      <span className="mt-auto block text-sm text-mist group-aria-selected:text-slate">{step.meta}</span>
                    ) : null}
                  </span>
                </SliderBtn>
              ))}
            </SliderBtnGroup>
          </ProgressSlider>
        </Reveal>

        {/* The phone gets the same four steps as cards rather than a slider,
            each the reference's slide in miniature: the photograph first, full
            bleed across the top of the card, then the number, title and copy. */}
        <ol className="mt-gutter space-y-6 md:hidden">
          {steps.map((step, i) => (
            // An ol may only contain li, so the Reveal wrapper goes inside it
            // rather than around it.
            <li key={step.title}>
              <Reveal index={i}>
                <div className="overflow-hidden rounded-brand bg-surface">
                  <Photo
                    name={stepPhotos[i].name}
                    position={stepPhotos[i].position}
                    sizes="100vw"
                    className="aspect-[16/10] w-full"
                  />
                  <div className="p-6">
                    <span className="inline-block rounded-brand bg-white/10 px-2.5 py-1 text-sm font-bold tabular-nums tracking-label text-offwhite">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-offwhite">{step.title}</h3>
                    {step.meta ? <p className="mt-1 text-sm text-mist">{step.meta}</p> : null}
                    <p className="mt-3 text-base leading-body text-offwhite">{step.body}</p>
                  </div>
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
          <h3 className="max-w-prose text-xl font-bold tracking-title">
            {howItWorks.reportHeading}
          </h3>

          <ul className="mt-tight divide-y divide-border border-y border-border">
            {howItWorks.report.map((line) => (
              <li key={line} className="py-5 text-lg leading-body text-offwhite">
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-tight max-w-prose text-base leading-body text-mist">
            {howItWorks.reportNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
