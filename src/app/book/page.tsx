import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BookingCalendar from '@/components/BookingCalendar';
import { EMAIL, book, services } from '@/lib/content';

export const metadata: Metadata = {
  title: book.title,
  description: book.description,
  alternates: { canonical: '/book/' },
};

const LINK =
  'font-bold text-charcoal underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-charcoal';

/** `lede` with `book.ledeLink.text` turned into a link to the assessment tab. */
function Lede() {
  const { text, href } = ledeParts();
  return (
    <>
      {text[0]}
      <a
        href={href}
        className="font-bold text-offwhite underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-offwhite"
      >
        {text[1]}
      </a>
      {text[2]}
    </>
  );
}

function ledeParts() {
  const { text, href } = book.ledeLink;
  const at = book.lede.toLowerCase().indexOf(text);
  return {
    href,
    text: [book.lede.slice(0, at), book.lede.slice(at, at + text.length), book.lede.slice(at + text.length)],
  };
}

/** The line under a tab's text that points at the other tab. */
function SwitchTo({ kind }: { kind: 'questions' | 'assessment' }) {
  const { lead, text, href } = book.switchTo[kind];
  return (
    <p className="mb-5 mt-3 max-w-[60ch] text-base leading-body text-slate">
      {lead}{' '}
      <a href={href} className={LINK}>
        {text}
      </a>
      .
    </p>
  );
}

/**
 * The booking page. It opens on the 15-minute call, which has no charge, so a
 * visitor from the outreach emails sees no price. The assessment is the second
 * tab, and its price, terms and recording notice sit in that tab's panel and show
 * only when it is selected. This is still the only page on the site with a price
 * on it. Plain `/book` and `/book/#questions-call` open the call; `/book/#assessment`
 * opens the assessment.
 *
 * Same grounds as the home page: a charcoal head under the floating nav, then an
 * off-white body with the tabs and the calendar at the full width of the frame.
 * Full width because Cal.com only lays out the month and the time slots side by
 * side above about 1000px. In a column beside the details it stacked them, and
 * picking a time meant scrolling a 1,400px tall widget.
 *
 * No Signal on this page. The action is the calendar's confirm button, which
 * Cal.com draws in charcoal, and a red price would read as a sale sticker.
 */
export default function BookPage() {
  const intro = {
    questions: (
      <>
        <p className="mb-3 max-w-[60ch] text-base leading-body text-slate">{book.panels.questions}</p>
        <SwitchTo kind="questions" />
      </>
    ),
    assessment: (
      <>
        <div className="mb-8 grid items-start gap-gutter md:grid-cols-2">
          <div>
            <p className="text-4xl font-bold tracking-claim">{book.price}</p>
            <p className="mt-2 text-base text-slate">{book.priceNote}</p>
            <ul className="mt-6 space-y-3 border-t border-neutral-200 pt-6">
              {services.frontDoorBeats.map((beat) => (
                <li key={beat} className="flex gap-3 text-base leading-body">
                  <span aria-hidden className="mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand bg-stone" />
                  {beat}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:pt-2">
            <p className="text-lg font-bold leading-snug">{book.refund}</p>
            {book.fineprint.map((line) => (
              <p key={line} className="mt-3 text-sm leading-body text-slate">
                {line}
              </p>
            ))}
          </div>
        </div>
        <p className="mb-3 max-w-[60ch] text-base leading-body text-slate">{book.panels.assessment}</p>
        <SwitchTo kind="assessment" />
      </>
    ),
  };

  return (
    <>
      <Nav showCta={false} />
      <main id="main">
        <section className="bg-charcoal pb-gutter pt-[calc(72px+theme(spacing.gutter))] text-offwhite sm:pt-[calc(72px+theme(spacing.frame))]">
          <div className="frame">
            <h1 className="max-w-[18ch] text-balance text-4xl font-bold tracking-claim">{book.heading}</h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-body text-mist">
              <Lede />
            </p>
          </div>
        </section>

        <section className="bg-offwhite py-frame text-charcoal">
          <div className="frame">
            <BookingCalendar intro={intro} />

            <p className="mt-tight text-sm text-slate">
              Rather email?{' '}
              <a href={`mailto:${EMAIL}`} className={LINK}>
                {EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer navHeading="On the home page" />
    </>
  );
}
