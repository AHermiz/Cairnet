import { tiers, mark } from '@/lib/tokens';

/**
 * A graphic per assessment step, drawn in the mark's own vocabulary.
 *
 * Every shape is a rounded rect at the mark's corner radius, filled flat from
 * `color.tiers.light`, on the Off-White ground. That is the test the profile sets
 * for illustration: could this sit next to the mark without looking like a
 * different company made it. No gradients, no line art, no characters, nothing
 * outside the palette.
 *
 * **No people, including on the research frame.** The brief for that one was
 * "somebody working on a computer". Characters, mascots and people are in the
 * Out column of the profile's illustration table, and stylized devices and
 * windows are in the In column, so it is the workstation with the comparison
 * happening on screen. Same idea, and it stays inside the rule.
 *
 * **Signal appears on two of the four, and only where it means something.** Not
 * on the conversation and not on the research, because nothing has been decided
 * at those points. On the report it marks the recommendation, and the walkthrough
 * carries the same mark because it is the same document being read together.
 * Marking all four would make red a highlighter.
 *
 * Drawn at a 360 x 240 viewBox and scaled by the container.
 */

const [STONE, SLATE, CHARCOAL, SIGNAL] = tiers.light;
const R = mark.radius; // 9, the brand's one corner radius

type Props = { step: number; className?: string };

/**
 * A speech bubble: the brand's rounded rect plus a tail. The tail is the whole
 * point. The first version of the conversation frame was two plain rects with
 * bars in them and it read as two text fields, which is what A saw.
 */
function Bubble({
  x,
  y,
  w,
  h,
  fill,
  side,
  bars,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  side: 'left' | 'right';
  bars: number[];
}) {
  // Bars have to contrast with the bubble they sit in. Stone bars in a Stone
  // bubble is invisible, which is exactly how the walkthrough frame shipped its
  // right hand bubble blank the first time.
  const barFill = fill === STONE ? CHARCOAL : STONE;
  const tailX = side === 'left' ? x + 20 : x + w - 20;
  const tail =
    side === 'left'
      ? `M${tailX} ${y + h - 2} L${tailX - 12} ${y + h + 18} L${tailX + 16} ${y + h - 2} Z`
      : `M${tailX} ${y + h - 2} L${tailX + 12} ${y + h + 18} L${tailX - 16} ${y + h - 2} Z`;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={R} fill={fill} />
      <path d={tail} fill={fill} />
      {bars.map((bw, i) => (
        <rect
          key={i}
          x={x + 20}
          y={y + 20 + i * 18}
          width={bw}
          height={9}
          rx={R / 2}
          fill={barFill}
          opacity={0.85}
        />
      ))}
    </>
  );
}

function Conversation() {
  return (
    <>
      <Bubble x={10} y={20} w={186} h={76} fill={SLATE} side="left" bars={[122, 88]} />
      <Bubble x={164} y={136} w={186} h={76} fill={CHARCOAL} side="right" bars={[132, 96]} />
    </>
  );
}

function Research() {
  // A workstation, mid comparison. Four candidates on screen, the third already
  // picked out. The match is marked by opacity and length rather than by a
  // different colour: the screen body is already charcoal, so a darker "found"
  // tier would disappear into it, and Signal is reserved for the two frames where
  // something has actually been decided.
  const rows = [0, 1, 2, 3];
  return (
    <>
      <rect x="34" y="22" width="292" height="152" rx={R} fill={CHARCOAL} />
      <rect x="50" y="38" width="260" height="120" rx={R} fill={SLATE} />

      {rows.map((r) => {
        const picked = r === 2;
        return (
          <g key={r} opacity={picked ? 1 : 0.42}>
            <rect x="64" y={52 + r * 26} width="22" height="14" rx={R / 2} fill={STONE} />
            <rect
              x="96"
              y={52 + r * 26}
              width={picked ? 196 : 148 - r * 16}
              height="14"
              rx={R / 2}
              fill={STONE}
            />
          </g>
        );
      })}

      {/* Stand. Enough to read as a screen on a desk rather than a floating panel. */}
      <rect x="166" y="174" width="28" height="24" rx={R / 2} fill={CHARCOAL} />
      <rect x="122" y="196" width="116" height="16" rx={R} fill={SLATE} />
    </>
  );
}

function Report() {
  return (
    <>
      {/* The document. One line is Signal: the recommendation. */}
      <rect x="86" y="16" width="188" height="208" rx={R} fill={CHARCOAL} />
      <rect x="110" y="48" width="140" height="12" rx={R / 2} fill={STONE} />
      <rect x="110" y="76" width="112" height="10" rx={R / 2} fill={SLATE} />
      <rect x="110" y="98" width="128" height="10" rx={R / 2} fill={SLATE} />
      <rect x="110" y="128" width="96" height="14" rx={R / 2} fill={SIGNAL} />
      <rect x="110" y="160" width="120" height="10" rx={R / 2} fill={SLATE} />
      <rect x="110" y="182" width="84" height="10" rx={R / 2} fill={SLATE} />
    </>
  );
}

function Walkthrough() {
  // The same report, now between two voices. Reusing the bubble from the
  // conversation frame is deliberate: the call at the end is the call at the
  // start, with a document on the table.
  return (
    <>
      <rect x="132" y="42" width="96" height="156" rx={R} fill={CHARCOAL} />
      <rect x="148" y="64" width="62" height="8" rx={R / 2} fill={STONE} opacity={0.8} />
      <rect x="148" y="80" width="48" height="8" rx={R / 2} fill={SLATE} />
      <rect x="148" y="102" width="56" height="11" rx={R / 2} fill={SIGNAL} />
      <rect x="148" y="126" width="52" height="8" rx={R / 2} fill={SLATE} />
      <rect x="148" y="142" width="40" height="8" rx={R / 2} fill={SLATE} />

      <Bubble x={6} y={24} w={108} h={58} fill={SLATE} side="right" bars={[64, 42]} />
      <Bubble x={246} y={126} w={108} h={58} fill={STONE} side="left" bars={[60, 38]} />
    </>
  );
}

const SHAPES = [Conversation, Research, Report, Walkthrough];
const LABELS = [
  'Two speech bubbles, a conversation with nothing marked yet',
  'A workstation comparing four options, with one already picked out',
  'A written report with one recommendation marked',
  'The same report between two speech bubbles, read together',
];

export default function StepGraphic({ step, className }: Props) {
  const Shape = SHAPES[step] ?? SHAPES[0];
  return (
    <svg
      viewBox="0 0 360 240"
      className={className}
      role="img"
      aria-label={LABELS[step] ?? LABELS[0]}
    >
      <Shape />
    </svg>
  );
}
