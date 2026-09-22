import { EMAIL, footer, nav } from '@/lib/content';

/**
 * Charcoal, quiet, and no Signal at all.
 *
 * The close directly above already asks for the sale twice and carries the
 * blaze. A footer that repeats the button would be the same intent competing
 * with itself, and red down here would be furniture.
 *
 * The tagline is not repeated either. It is the closing section's heading a few
 * hundred pixels up, and saying it twice in one screen weakens it.
 *
 * The lockup rather than the bare mark, because this is the one place on the page
 * where the company's full name and descriptor should sit plainly.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-charcoal pb-10 pt-frame text-mist">
      <div className="frame">
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/cairnet-lockup-horizontal-reversed.svg"
              alt="Cairnet, AI Integration"
              width={196}
              height={50}
              className="h-[50px] w-auto"
            />
            <p className="mt-6 max-w-[34ch] text-base leading-body text-stone">{footer.area}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-bold text-offwhite">On this page</h2>
            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-base text-mist transition-colors duration-200 ease-state hover:text-offwhite"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold text-offwhite">Get in touch</h2>
            <p className="mt-4">
              <a
                href={`mailto:${EMAIL}`}
                className="text-base text-mist underline decoration-slate underline-offset-4 transition-colors duration-200 ease-state hover:text-offwhite hover:decoration-offwhite"
              >
                {EMAIL}
              </a>
            </p>
            <p className="mt-3 max-w-[30ch] text-sm leading-body text-stone">
              Email reaches a person and you keep the thread.
            </p>
          </div>
        </div>

        <div className="mt-frame flex flex-col gap-2 border-t border-border pt-6 text-sm text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Cairnet</p>
          <p>cairnetint.com</p>
        </div>
      </div>
    </footer>
  );
}
