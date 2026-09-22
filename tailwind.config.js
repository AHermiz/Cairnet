const tokens = require('./tokens.json');

// Every colour, font and motion value below is read out of tokens.json.
// Nothing in this repo may hand-type a brand value. If a number needs to change,
// it changes in the brand token file and flows from here.
//
// Two quantities are declared locally, and deliberately:
//
//   type.scale in tokens.json is post geometry, ratios of a 1080px canvas that a
//   viewer sees scaled down to phone size. Body there is 30 units, which is about
//   11 effective pixels on a phone. Web type is read at 1:1 with a 16px floor, so
//   the post scale cannot be transferred, only re-derived. The scale below is a
//   1.25 modular scale anchored at 17px.
//
//   space in tokens.json is also ratios of canvas width, and those DO transfer,
//   because a margin as a fraction of its container is the same quantity on a page
//   as on a frame. They are resolved against the brand's own 1080 canvas and named
//   `frame`, `gutter`, `tight` and `hairline` below. The 4px rhythm steps around
//   them are Tailwind's defaults.
//
// Both gaps are worth closing in tokens.json. Flagged, not silently patched.

const { brand, semantic, neutral, tiers } = tokens.color;

// The mark's corner radius as a ratio of its own grid: 9 / 200. The brand rule is
// "never a pill, never square", and this is the number behind it.
const radius = `${Math.round(tokens.mark.radius / tokens.mark.grid * 200)}px`;

// space ratios resolved against the brand canvas width. `frameMargin` is renamed
// to `frame` so the class reads as `pb-frame`; everything else keeps its name.
const canvas = tokens.canvas.feed.w;
const RENAME = { frameMargin: 'frame' };
const space = Object.fromEntries(
  Object.entries(tokens.space)
    .filter(([k]) => !k.startsWith('$'))
    .map(([k, v]) => [RENAME[k] ?? k, `${Math.round(v * canvas)}px`])
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: brand.charcoal,
        slate: brand.slate,
        stone: brand.stone,
        mist: brand.mist,
        offwhite: brand.offWhite,
        signal: brand.signal,
        surface: semantic.surface,
        'surface-raised': semantic.surfaceRaised,
        border: semantic.border,
        neutral: Object.fromEntries(
          Object.entries(neutral).filter(([k]) => !k.startsWith('$'))
        ),
      },
      fontFamily: {
        // One family, two weights. tokens.type.face names the browser-side family.
        sans: [`var(--font-${tokens.type.face.body.family.toLowerCase()})`, 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: String(tokens.type.face.body.weight),
        bold: String(tokens.type.face.display.weight),
      },
      fontSize: {
        // 1.25 modular scale, 17px base. See the note at the top of this file.
        xs: ['0.8125rem', { lineHeight: '1.45' }],   // 13
        sm: ['0.9375rem', { lineHeight: '1.5' }],    // 15
        base: ['1.0625rem', { lineHeight: '1.6' }],  // 17
        lg: ['1.3125rem', { lineHeight: '1.5' }],    // 21
        xl: ['1.6875rem', { lineHeight: '1.35' }],   // 27
        '2xl': ['2.0625rem', { lineHeight: '1.2' }], // 33
        '3xl': ['2.625rem', { lineHeight: '1.15' }], // 42
        '4xl': ['3.25rem', { lineHeight: '1.1' }],   // 52
        '5xl': ['4.0625rem', { lineHeight: '1.05' }],// 65
        // Button labels. Signal against Off-White is 4.48:1, which clears AA for
        // large text (>= 18.66px bold) and misses AA for body text by a hair. 19px
        // bold is the floor that keeps a filled Signal button legal.
        cta: ['1.1875rem', { lineHeight: '1' }],     // 19
        // Fluid display sizes. The ceiling stays under 96px: above that a page is
        // shouting rather than designing.
        // `display` is the claim. `claim` is the answer under it, deliberately a
        // clear step down: the two were nearly the same size at first and the
        // hierarchy went flat.
        display: ['clamp(2.25rem, 1.15rem + 3.4vw, 3.5rem)', { lineHeight: '1.06' }],
        claim: ['clamp(1.6875rem, 1.1rem + 2vw, 2.625rem)', { lineHeight: String(tokens.layout.statement.leading) }],
      },
      lineHeight: {
        claim: String(tokens.layout.statement.leading),
        body: String(tokens.type.leading.body),
        display: String(tokens.type.leading.display),
      },
      letterSpacing: {
        // The wordmark is set solid. Display type follows it and never goes tighter
        // than -0.02em, which is where Poppins Bold starts to collide.
        claim: '-0.02em',
      },
      spacing: space,
      borderRadius: {
        DEFAULT: radius,
        brand: radius,
      },
      maxWidth: {
        page: '1180px',
        prose: '62ch',
      },
      transitionTimingFunction: {
        settle: `cubic-bezier(${tokens.motion.easing.settle.join(',')})`,
        state: `cubic-bezier(${tokens.motion.easing.stateChange.join(',')})`,
      },
      zIndex: {
        // A named scale, so nothing ever reaches for z-9999.
        sticky: '30',
        overlay: '40',
        modal: '50',
      },
    },
  },
  plugins: [
    // Publish the tiers and a few semantic roles as CSS variables so inline SVG and
    // globals.css can read them without a second copy of the hex.
    function ({ addBase }) {
      addBase({
        ':root': {
          '--tier-light-0': tiers.light[0],
          '--tier-light-1': tiers.light[1],
          '--tier-light-2': tiers.light[2],
          '--tier-light-3': tiers.light[3],
          '--tier-dark-0': tiers.dark[0],
          '--tier-dark-1': tiers.dark[1],
          '--tier-dark-2': tiers.dark[2],
          '--tier-dark-3': tiers.dark[3],
          '--ground-dark': semantic.groundDark,
          '--ground-light': semantic.groundLight,
          '--accent': semantic.accent,
          '--radius': radius,
        },
      });
    },
  ],
};
