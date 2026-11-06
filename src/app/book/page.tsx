import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BookingCalendar from '@/components/BookingCalendar';
import { EMAIL, book, services } from '@/lib/content';

export const metadata: Metadata = {
  title: book.title,
  description: book.lede,
  alternates: { canonical: '/book/' },
};

/**
 * The booking page, and the only page on the site with a price on it.
 *
 * Same grounds as the home page: a charcoal head under the floating nav, then an
 * off-white body. First a row of everything someone wants settled before they
 * pay (the number, what it buys, how to get out of it, and the call for anyone
 * not ready), then the calendar at the full width of the frame.
 *
 * Full width because Cal.com only lays out the month and the time slots side by
 * side above about 1000px. In a column beside the details it stacked them, and
 * picking a time meant scrolling a 1,400px tall widget.
 *
 * No Signal on this page. The action is the calendar's confirm button, which
 * Cal.com draws in charcoal, and a red price would read as a sale sticker.
 */
export default function BookPage() {
  return (
    <>
      <Nav showCta={false} />
      <main id="main">
        <section className="bg-charcoal pb-gutter pt-[calc(72px+theme(spacing.gutter))] text-offwhite sm:pt-[calc(72px+theme(spacing.frame))]">
          <div className="frame">
            <h1 className="max-w-[18ch] text-balance text-4xl font-bold tracking-claim">{book.heading}</h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-body text-mist">{book.lede}</p>
          </div>
        </section>

        <section className="bg-offwhite py-frame text-charcoal">
          <div className="frame">
            <div className="grid items-start gap-gutter md:grid-cols-2 lg:grid-cols-3">
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

              <div className="lg:pt-2">
                <p className="text-lg font-bold leading-snug">{book.refund}</p>
                {book.fineprint.map((line) => (
                  <p key={line} className="mt-3 text-sm leading-body text-slate">
                    {line}
                  </p>
                ))}
              </div>

              <div className="rounded-brand bg-neutral-100 p-6 md:col-span-2 lg:col-span-1">
                <h2 className="text-lg font-bold">{book.questions.heading}</h2>
                <p className="mt-2 text-base leading-body text-slate">{book.questions.body}</p>
                <a
                  href="#questions-call"
                  className="mt-5 inline-flex items-center justify-center rounded-brand border border-slate px-5 py-3 text-sm font-bold text-charcoal transition-[background-color,border-color,transform] duration-200 ease-state hover:border-charcoal hover:bg-neutral-200/60 active:scale-[0.97]"
                >
                  {book.questions.cta}
                </a>
              </div>
            </div>

            <div className="mt-frame">
              <BookingCalendar />
            </div>

            <p className="mt-tight text-sm text-slate">
              Rather email?{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="font-bold text-charcoal underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-charcoal"
              >
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
