'use client';

import { MouseEvent, useId, useState } from 'react';
import { mailtoFor, services } from '@/lib/content';
import Button from './Button';
import ServiceGraphic from './ServiceGraphic';

type Item = {
  name: string;
  promise: string;
  body: string;
  detail: { what: string; included: string[]; ask: string; subject: string };
};

/**
 * One of the three service cards, which opens in place to show what the service
 * is and what's included, and offers an email about it. Added 2026-09-24, because
 * the lede tells someone who knows what they want to go straight to it and the
 * cards used to lead nowhere.
 *
 * **Why this is not a `<details>` like the FAQ.** A wanted the whole card to be
 * the thing you click, and a `<summary>` would have to wrap the graphic, the name
 * and the body copy, which makes all of it the accessible name of one control.
 * So the card takes the pointer click, and a real `<button>` inside it carries
 * `aria-expanded` and an `aria-controls` that points at a panel which is always in
 * the DOM. Keyboard and screen reader users get a normal disclosure button. The
 * card's click handler is the only toggle, so a click on the button reaches it
 * by bubbling and never runs twice.
 *
 * Clicks inside the open panel are ignored, so selecting text or pressing the
 * email button doesn't fold the card shut under the reader.
 *
 * The height animates on `grid-template-rows`, 0fr to 1fr, which needs no
 * measuring and no JS animation library. `invisible` takes the closed panel out
 * of the tab order and the accessibility tree, and because visibility changes at
 * the end of a transition, it stays visible while the card is closing. The
 * reduced-motion block in globals.css zeroes the duration.
 *
 * Until React hydrates, the button does nothing. The section is well below the
 * fold, so by the time a reader gets here it has.
 */
export default function ServiceDoor({ item, index }: { item: Item; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  function toggle(e: MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest('[data-door-panel]')) return;
    setOpen((o) => !o);
  }

  return (
    <article
      onClick={toggle}
      className="group h-full cursor-pointer overflow-hidden rounded-brand border border-border transition-colors duration-200 ease-state hover:border-stone"
    >
      <ServiceGraphic service={index} ground="dark" className="h-[120px] w-full bg-surface" />
      <div className="p-7 sm:p-8">
        <h3 className="text-xl font-bold tracking-claim text-offwhite">{item.name}</h3>
        <p className="mt-2 text-cta font-bold leading-snug text-mist">{item.promise}</p>
        <p className="mt-4 max-w-prose text-base leading-body text-mist">{item.body}</p>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="mt-6 flex items-center gap-3 rounded-brand text-base font-bold text-offwhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-offwhite"
        >
          {/* Plus to minus, the FAQ's glyph: two rounded rects, the brand's one
              shape, with the vertical one collapsing when the card is open. */}
          <span aria-hidden className="relative h-4 w-4 shrink-0">
            <span className="absolute left-0 top-[7px] h-[2px] w-4 rounded-brand bg-offwhite" />
            <span
              className={`absolute left-[7px] top-0 h-4 w-[2px] rounded-brand bg-offwhite transition-transform duration-200 ease-state ${
                open ? 'scale-y-0' : ''
              }`}
            />
          </span>
          {services.detailLabel}
        </button>

        <div
          id={panelId}
          data-door-panel
          className={`grid cursor-auto transition-[grid-template-rows,visibility] duration-300 ease-state ${
            open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-6 border-t border-border pt-6">
              <p className="max-w-prose text-base leading-body text-mist">{item.detail.what}</p>
              <ul className="mt-5 space-y-3">
                {item.detail.included.map((line) => (
                  <li key={line} className="flex gap-3 text-base leading-body text-offwhite">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand bg-stone"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              {/* Ghost, never Signal: this section spends no red on buttons, and
                  the filled one stays the assessment's. */}
              <Button href={mailtoFor(item.detail.subject)} variant="ghost" className="mt-7">
                {item.detail.ask}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
