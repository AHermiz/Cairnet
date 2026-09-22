import { tiers, mark } from '@/lib/tokens';

/**
 * A band across the top of each service card, in the mark's vocabulary.
 *
 * **Flat.** Solid fills from the tier sets, nothing outside the palette, no
 * gradients. A thin stroke is allowed where a shape genuinely needs one, which
 * here is only the steering wheel's rim and its arrows: a ring cannot be made
 * from a fill without punching a hole in it.
 *
 * **120 tall, not 96, and the drawing is boxed.** Every graphic lives inside
 * y 26..94, so there is real cushion top and bottom instead of artwork running
 * to the edges, and all four are centred on x 160.
 *
 * **No Signal on any of the four.** The edge blaze on the front-door card is the
 * one accent this section gets, and it is doing real work: it marks which service
 * you start with. Putting red in four graphics as well would be five accents in
 * one screen against a ceiling of roughly three, and the blaze would stop meaning
 * anything.
 *
 * Ground aware, because the front-door card is inverted onto Off-White while the
 * other three sit on charcoal. The tier arrays are ordered the same way on both
 * grounds, so index 0 is the muted tier, 1 is the middle and 2 is the strongest,
 * and a graphic drawn once reads correctly on either.
 */

const R = mark.radius;
const RAD = Math.PI / 180;

/** The band, and the strip inside it the drawings are allowed to use. */
const BAND = { w: 320, h: 120 };

type Props = { service: number; ground?: 'dark' | 'light'; className?: string };
type Colors = { muted: string; mid: string; ink: string };

function palette(ground: 'dark' | 'light'): Colors {
  const t = ground === 'dark' ? tiers.dark : tiers.light;
  return { muted: t[0], mid: t[1], ink: t[2] };
}

/* Ticks and crosses built from rounded bars, so they stay filled shapes. */
function Tick({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x="-9" y="-2" width="11" height="5" rx="2.5" fill={fill} transform="rotate(45 -3.5 0.5)" />
      <rect x="-4" y="-2" width="20" height="5" rx="2.5" fill={fill} transform="rotate(-45 6 0.5)" />
    </g>
  );
}

function Cross({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x="-9" y="-2.5" width="19" height="5" rx="2.5" fill={fill} transform="rotate(45 0.5 0)" />
      <rect x="-9" y="-2.5" width="19" height="5" rx="2.5" fill={fill} transform="rotate(-45 0.5 0)" />
    </g>
  );
}

/** Your week, gone through line by line and marked up. */
function Assessment({ muted, mid, ink }: Colors) {
  const rows = [44, 60, 76];
  return (
    <>
      <rect x="90" y="26" width="140" height="68" rx={R} fill={ink} />
      {rows.map((y, i) => (
        <g key={y}>
          {i < 2 ? <Tick cx={112} cy={y} fill={mid} /> : <Cross cx={112} cy={y} fill={mid} />}
          <rect
            x="136"
            y={y - 3}
            width="76"
            height="6"
            rx="3"
            fill={muted}
            opacity={i < 2 ? 0.9 : 0.5}
          />
        </g>
      ))}
    </>
  );
}

/** A site that gets found, and someone on it. */
function Website({ muted, mid, ink }: Colors) {
  return (
    <>
      <rect x="82" y="26" width="176" height="68" rx={R} fill={ink} />
      <rect x="82" y="26" width="176" height="16" rx={R} fill={mid} />
      <circle cx="94" cy="34" r="3" fill={muted} />
      <circle cx="104" cy="34" r="3" fill={muted} />
      <circle cx="114" cy="34" r="3" fill={muted} />
      <rect x="96" y="54" width="98" height="8" rx="4" fill={muted} opacity={0.9} />
      <rect x="96" y="68" width="68" height="7" rx="3.5" fill={mid} />
      <rect x="96" y="80" width="46" height="7" rx="3.5" fill={mid} />
      <path d="M206 58 L206 90 L214.5 81.5 L221 94 L228 90.5 L221.5 78.5 L232 77.5 Z" fill={muted} />
    </>
  );
}

/**
 * The repetitive work, running on its own.
 *
 * It is not the wheel that says autopilot, it is the two arrows turning around
 * it with nobody holding it. A steering wheel on its own is just a steering
 * wheel. Both arrows run clockwise; their heads point opposite ways because
 * clockwise travel goes right at the top of a circle and left at the bottom,
 * which is what makes it read as one direction of rotation rather than two
 * arrows arguing. The dashes on each flank are the motion lines.
 */
function Autopilot({ muted, mid, ink }: Colors) {
  const cx = 160;
  const cy = 60;
  const at = (a: number, r: number) => [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)] as const;
  const arc = (a1: number, a2: number, r: number) => {
    const [x1, y1] = at(a1, r);
    const [x2, y2] = at(a2, r);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const head = (a: number, r: number) => {
    const [x, y] = at(a, r);
    return (
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a + 90})`}>
        <path d="M-6 -5.5 L7 0 L-6 5.5 Z" fill={mid} />
      </g>
    );
  };
  return (
    <>
      {([[171, 189, 44], [173, 187, 53], [-9, 9, 44], [-7, 7, 53]] as const).map(([a1, a2, r], i) => (
        <path
          key={i}
          d={arc(a1, a2, r)}
          fill="none"
          stroke={muted}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.65}
        />
      ))}

      <path d={arc(188, 248, 34)} fill="none" stroke={mid} strokeWidth="5" strokeLinecap="round" />
      {head(250, 34)}
      <path d={arc(8, 68, 34)} fill="none" stroke={mid} strokeWidth="5" strokeLinecap="round" />
      {head(70, 34)}

      <circle cx={cx} cy={cy} r="21" fill="none" stroke={ink} strokeWidth="7" />
      {[0, 180, 90].map((a) => {
        const [sx, sy] = at(a, 8);
        const [ex, ey] = at(a, 18);
        return <line key={a} x1={sx} y1={sy} x2={ex} y2={ey} stroke={ink} strokeWidth="6" strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r="8.5" fill={ink} />
    </>
  );
}

/** Answers, at 9pm on a Sunday. */
function FrontDesk({ muted, mid, ink }: Colors) {
  return (
    <>
      <circle cx="142" cy="48" r="17" fill={ink} />
      <path d="M112 94 a30 30 0 0 1 60 0 z" fill={ink} />
      <path d="M119 50 a23 23 0 0 1 46 0 h-6 a17 17 0 0 0 -34 0 z" fill={mid} />
      <rect x="115" y="44" width="9" height="16" rx="4.5" fill={mid} />
      <rect x="160" y="44" width="9" height="16" rx="4.5" fill={mid} />
      <rect x="160" y="60" width="6" height="18" rx="3" fill={mid} transform="rotate(28 163 69)" />
      <circle cx="153" cy="76" r="4" fill={mid} />
      <rect x="190" y="50" width="6" height="20" rx="3" fill={muted} />
      <rect x="202" y="43" width="6" height="34" rx="3" fill={muted} opacity={0.7} />
      <rect x="214" y="36" width="6" height="48" rx="3" fill={muted} opacity={0.45} />
    </>
  );
}

const SHAPES = [Assessment, Website, Autopilot, FrontDesk];
const LABELS = [
  'A page of findings, two ticked off and one crossed out',
  'A browser window with a page in it and a cursor',
  'A steering wheel turning on its own',
  'Someone on a headset, with the line open',
];

export default function ServiceGraphic({ service, ground = 'dark', className }: Props) {
  const Shape = SHAPES[service] ?? SHAPES[0];
  const colors = palette(ground);
  return (
    <svg
      viewBox={`0 0 ${BAND.w} ${BAND.h}`}
      className={className}
      role="img"
      aria-label={LABELS[service] ?? LABELS[0]}
    >
      <Shape {...colors} />
    </svg>
  );
}
