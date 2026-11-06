/**
 * A stock photograph, pulled toward the palette. Added 2026-11-03 with the
 * photos in How an assessment runs and on the service folders.
 *
 * The grade is muted colour, A's pick of three on 2026-11-03: about half
 * saturation, the same grade the hero photograph carries, with a light charcoal
 * scrim. It started at 12% saturation, the letter of the brand rule
 * (profiles/cairnet.md, Bans, assets: pull a photo toward the palette so it is
 * not a second brand on the page), and A judged the page too grey for it. The
 * trade is known: some photos now bring their own colour, the yellow sign and
 * the teal laptop screen most of all. The two options it beat are noted in
 * public/media/CREDITS.md in case this is revisited. The grade is applied here
 * rather than baked into the files, so the originals stay untouched and the
 * grade moves in one place.
 *
 * Decorative by default: each one sits beside copy that already says what the
 * step or service is, so a description would only make a screen reader say it
 * twice.
 *
 * Files are `public/media/<name>-640.webp` and `-1200.webp`, plus `-2000` for
 * the step photos; sources and licences are in `public/media/CREDITS.md`.
 */
export default function Photo({
  name,
  className = '',
  position = 'center',
  sizes = '(min-width: 1024px) 480px, 100vw',
  large = false,
}: {
  name: string;
  className?: string;
  /** object-position, for where the crop falls. */
  position?: string;
  sizes?: string;
  /** Also offer a 2000-wide file, for the full-width How it works stage on a
   * high-density screen, where 1200 came out visibly soft. Only the step photos
   * have one. */
  large?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={`/media/${name}-1200.webp`}
        srcSet={`/media/${name}-640.webp 640w, /media/${name}-1200.webp 1200w${
          large ? `, /media/${name}-2000.webp 2000w` : ''
        }`}
        sizes={sizes}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.55)_contrast(1.02)_brightness(0.9)]"
        style={{ objectPosition: position }}
      />
      <span aria-hidden className="absolute inset-0 bg-charcoal/[0.22]" />
    </div>
  );
}
