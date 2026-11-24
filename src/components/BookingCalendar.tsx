'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { color } from '@/lib/tokens';
import { book } from '@/lib/content';

/**
 * The Cal.com calendar, inline, with the two things a visitor can book.
 *
 * `CAL_USER` is the live Cal.com account (cal.com/cairnet). The two slugs are
 * its public Links: `assessment` ("Cairnet Assessment", CA$799.99) and
 * `questions` ("Ask us anything", 15 minutes, no charge). The account's hidden
 * Links (`walkthrough`, `assessment-rescheduled`) are sent by A by hand and never
 * belong on the site. Payment, the refund rule and the booking form all live in
 * Cal.com's Link settings, not here.
 *
 * Cal.com's own loader snippet, unchanged apart from types, so it is loaded only
 * on this page and never on the home page. Each event gets its own namespace and
 * its own iframe, and the questions call is only initialised the first time
 * someone opens its tab, so a visitor who books the assessment loads one iframe.
 *
 * Charcoal is the calendar's brand colour, not Signal. The selected day, the
 * time slots and the confirm button all take it, and red on every slot would be
 * chrome.
 *
 * The 15-minute call is the first tab and the default. `#questions-call` (also
 * what the outreach emails link to) opens it, `#assessment` opens the assessment,
 * and anything else, including no hash, opens the call. Nothing on the page has
 * an id equal to either hash, on purpose: the browser's own jump to a matching id
 * once landed about 500px below the tabs on a first load, and the tabs sit near
 * the top of the page anyway. Links on the page that change the hash scroll the
 * tabs into view themselves, only when they are not already on screen.
 *
 * What each tab says above its calendar (the price and terms, for the assessment)
 * comes in as `intro`, so it is in the DOM but `hidden` until its tab is chosen.
 */

const CAL_ORIGIN = 'https://app.cal.com';
const CAL_USER = 'cairnet';

const EVENTS = {
  assessment: `${CAL_USER}/assessment`,
  questions: `${CAL_USER}/questions`,
} as const;

type Kind = keyof typeof EVENTS;

const HASH: Record<Kind, string> = { questions: '#questions-call', assessment: '#assessment' };

const kindFromHash = (hash: string): Kind => (hash === HASH.assessment ? 'assessment' : 'questions');

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns: Record<string, (...args: unknown[]) => void>;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

function loadCal() {
  if (window.Cal) return;
  /* eslint-disable */
  (function (C: any, A: string, L: string) {
    let p = function (a: any, ar: any) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal; let ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) {
        const api: any = function () { p(api, arguments); };
        const namespace = ar[1]; api.q = api.q || [];
        if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); }
        else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, `${CAL_ORIGIN}/embed/embed.js`, 'init');
  /* eslint-enable */
}

function mount(kind: Kind) {
  const Cal = window.Cal!;
  Cal('init', kind, { origin: CAL_ORIGIN });
  Cal.ns[kind]('inline', {
    elementOrSelector: `#cal-${kind}`,
    calLink: EVENTS[kind],
    config: { layout: 'month_view', theme: 'light' },
  });
  Cal.ns[kind]('ui', {
    theme: 'light',
    layout: 'month_view',
    hideEventTypeDetails: false,
    // Off-White behind the calendar rather than Cal.com's pure white, which is
    // not in the palette and would read as a pasted-in widget.
    cssVarsPerTheme: { light: { 'cal-brand': color.charcoal, 'cal-bg': color.offWhite } },
  });
}

export default function BookingCalendar({ intro }: { intro: Record<Kind, ReactNode> }) {
  const [active, setActive] = useState<Kind>('questions');
  const mounted = useRef<Set<Kind>>(new Set());
  const top = useRef<HTMLDivElement>(null);

  const show = useCallback((kind: Kind) => {
    setActive(kind);
    if (!mounted.current.has(kind)) {
      mounted.current.add(kind);
      // After the panel is unhidden, so Cal measures a visible container.
      requestAnimationFrame(() => mount(kind));
    }
  }, []);

  useEffect(() => {
    loadCal();
    show(kindFromHash(window.location.hash));
    const onHashChange = () => {
      // Flushed now, so the new panel's height is in the layout before measuring.
      flushSync(() => show(kindFromHash(window.location.hash)));
      // A link on the page (or the nav) changed the hash. If the tabs are under
      // the nav or off the bottom of the screen, bring them into view.
      const el = top.current;
      if (!el) return;
      const { top: y } = el.getBoundingClientRect();
      if (y < 96 || y > window.innerHeight - 160) {
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [show]);

  const select = (kind: Kind) => {
    show(kind);
    const url = `${window.location.pathname}${HASH[kind]}`;
    window.history.replaceState(null, '', url);
  };

  const tabs: Kind[] = ['questions', 'assessment'];

  return (
    <div ref={top} id="booking" className="scroll-mt-28">
      <div
        role="tablist"
        aria-label="What to book"
        className="inline-flex flex-wrap gap-1 rounded-brand bg-neutral-100 p-1"
      >
        {tabs.map((kind) => (
          <button
            key={kind}
            type="button"
            role="tab"
            id={`tab-${kind}`}
            aria-selected={active === kind}
            aria-controls={`panel-${kind}`}
            onClick={() => select(kind)}
            className={`flex flex-col items-start rounded-brand px-4 py-2.5 text-left transition-[background-color,color,transform] duration-200 ease-state active:scale-[0.97] ${
              active === kind ? 'bg-charcoal text-offwhite' : 'text-slate hover:text-charcoal'
            }`}
          >
            <span className="text-sm font-bold tracking-label">{book.tabs[kind].label}</span>
            <span className={`text-xs ${active === kind ? 'text-mist' : 'text-slate'}`}>{book.tabs[kind].note}</span>
          </button>
        ))}
      </div>

      {tabs.map((kind) => (
        <div
          key={kind}
          role="tabpanel"
          id={`panel-${kind}`}
          aria-labelledby={`tab-${kind}`}
          hidden={active !== kind}
          className="mt-6"
        >
          {intro[kind]}
          <div
            id={`cal-${kind}`}
            className="min-h-[560px] w-full overflow-hidden rounded-brand border border-neutral-200"
          />
          <p className="mt-4 text-sm text-slate">
            {book.fallback}{' '}
            <a
              href={`https://cal.com/${EVENTS[kind]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-charcoal underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-charcoal"
            >
              {book.fallbackLink}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}
