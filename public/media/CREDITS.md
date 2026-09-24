# Media credits

## hero-cairn-\*.webp

A hand-stacked cairn on a clifftop plateau above a sea of cloud, one walker
beside it for scale.

| | |
|---|---|
| Origin | Generated, not photographed |
| Model | Nano Banana Pro (Google), via the Higgsfield MCP server |
| Generated | 2026-09-20 |
| Cost | 2 credits for 2 variants. This is variant B |
| Job id | `85a38b31-fc0b-4dbd-9cbc-2da208675683` |
| Processing | Resized to 960, 1600 and 2400 wide at the source 16:9, plus a 900x1400 portrait crop for phones. WebP, quality 58 / 50 / 40 / 52. 196 KB for the whole set |

**The portrait crop is centred on the cairn, not on the frame.** The cairn sits
about 35% across, so a centre crop of a 16:9 source cuts the stack in half on a
phone. The crop window is computed from that ratio in the conversion script
rather than eyeballed.

### The brief

The look is taken from the background video in the 21st.dev hero component A
picked: a miniature diorama plateau floating above a cloud sea, low raking sun,
photoreal but unreal in scale. Frames were pulled off that video and looked at
rather than described from memory. The subject swaps their figure-with-a-laptop
for the cairn, which is the brand's own metaphor.

Prompt is in the session transcript. The parts that mattered: *hand-stacked
stone cairn*, *island of land with sheer rock sides*, *sea of sunlit cumulus*,
*low raking sun from the right*, *tilt-shift miniature scale*, and a negative
list covering text, logos, buildings and power lines.

### The grade, and why it is not heavier

`saturate(0.55) contrast(1.02) brightness(0.72)`.

The photograph this replaced ran at `saturate(0.12) brightness(0.62)`, which put
it firmly in palette. The same treatment on this frame killed the miniature
quality that is the entire reason for the reference, so it is graded lighter.
Signal is still the only saturated colour on the screen because nothing else on
the page competes.

The cost of the lighter grade is contrast headroom, measured against the
composited pixels rather than assumed:

| | Desktop | Phone | Floor |
|---|---|---|---|
| h1, Off-White | 5.72 | 4.69 | 3.0 |
| payoff, Off-White | 7.11 | 5.28 | 3.0 |
| payoff, Mist | 4.63 | 3.43 | 3.0 |
| lede, Mist 17px | 5.25 | 4.77 | 4.5 |

**Phones needed a third scrim to pass.** The portrait crop is a brighter part of
the frame and there is no right-hand scrim below `lg`, so the lede came out at
4.2:1 against a 4.5 floor. A bottom-up charcoal gradient at 0.42 alpha, `lg:hidden`,
takes it to 4.77. That failure was invisible on desktop, which is the argument
for measuring both.

**If the grade is ever lightened further, re-measure.** The phone lede is the
tightest number on the page and it is the one that breaks first.

## Retired

`hero-cairn-*` previously held a photograph by Nicholas Martinelli via Unsplash
(`unsplash.com/photos/stone-cairn-on-a-rocky-mountain-summit-_TzEIgfgaAw`, free
licence, no attribution required). Replaced 2026-09-20 by the generated frame
above. Recorded here in case the photo is ever wanted back; it needs no
permission and the same filenames.

---

## hero-loop-1928.mp4

The hero loop. 1928x1076, 10 seconds, silent, H.264, 12.2 MB.

| | |
|---|---|
| Origin | Generated, not filmed |
| Model | Kling v3.0, `pro`, 10s, sound off, 16:9, via the Higgsfield MCP server |
| Generated | 2026-09-23 |
| Cost | 17.5 credits. Four generations were run in total; this is the second |
| Inputs | `hero-cairn-2400.webp` as **both** `start_image` and `end_image` |

### Prompt

> A locked-off shot of a stone cairn on a clifftop above a sea of cloud. The
> cloud fills the lower half of the frame and flows steadily from right to left,
> the way slow weather actually moves: individual cloud banks visibly travel
> across the frame and billow softly as they go. Continuous and unhurried, never
> fast, never turbulent. Thin mist rises up the cliff face, thickens, and thins
> away again. The grass on the plateau ripples in a light steady wind. Sunlight
> warms and cools a little as cloud passes across it. The single standing figure
> does not walk and does not turn around: they stay exactly where they are,
> looking out over the cloud. The stone cairn is completely motionless, every
> stone fixed in place. The camera does not move, zoom, pan or shake. No cuts, no
> new subjects entering frame, no birds, no text. Calm and cinematic. The cloud
> motion continues through the whole shot and the last frame matches the first so
> it loops seamlessly.

### Measured, not eyeballed

Motion between the first frame and the midpoint, as the percentage of pixels
changing by more than 8 levels:

| region | moved |
|---|---|
| sky | 0% |
| cloud sea | 8.5% |
| ground and grass | 30.2% |
| cairn stones | 5.9% |

Loop seam, first frame against last: 0% to 0.4% across every region. It loops
cleanly.

**The cairn was checked on edges, not pixels.** A raw pixel diff read 82% changed
on an earlier take and looked like the stones re-forming; it was mist passing
over them. Sobel edge maps, contrast-normalised so fog cannot affect the result,
then cross-correlated: the stone edges hold position to within one or two pixels
for the whole clip. **Use that method, not a pixel diff, on any future take.**

### Three things that were learned the expensive way

**Matched start and end frames force a there-and-back motion.** If the last frame
must equal the first, anything that travels has to travel back. The first attempt
resolved that by not moving at all: 0% of sky pixels changed, 0.1% of cloud. This
one ping-pongs instead, reversing around the five second mark, about 1 to 2 px per
second on a 1928px frame. That reversal is the price of a seamless loop and it is
not fixable by prompting.

**Ten seconds, not five.** The first attempt was five seconds and froze. Matched
endpoints leave no room to travel and return in that time.

**Dropping the end frame gives real one-way flow and costs the scene.** A third
take with `start_image` only reached 49.6% of cloud pixels moving with no
reversal, but nothing then anchored the frame: the camera pushed in, exposure
climbed 67% in the sky, and the walker drifted. A fourth take ended on the
approved still with a hiker walking in, and had almost no cloud motion at all
plus a 1.1% push-in. The end frame is doing two jobs, the loop and the anchor,
and removing it loses both.

### Resolution: ship the full 1928, do not downscale

Shipped briefly at 960 for desktop and 640 for phones, on the reasoning that the
grade and scrims hide compression. That was tested at `deviceScaleFactor: 1`,
which is a display nobody owns. On real hardware:

| | source | upscale |
|---|---|---|
| phone, DPR 3 | 640x356 | **7.11x** |
| phone, DPR 3 | 1928x1076 | 2.35x |
| desktop, DPR 2 | 960x536 | **3.36x** |
| desktop, DPR 2 | 1928x1076 | 1.49x |
| the still, for comparison | 900x1400 portrait | 1.81x phone, 2.24x desktop |

**A 16:9 clip in a portrait hero is scaled to cover by its height, not its
width.** The phone box is 2532 device pixels tall and the video is 1076 tall.
Width was never the constraint, so sizing against it produced a seventh-resolution
hero that visibly fell off the moment the video replaced the still.

Cropping to portrait would not fix this: it removes width, and height is what
binds. It would cut the file size by about two thirds for identical sharpness,
because the browser already discards roughly 74% of each frame, but that needs a
toolchain this machine does not have. `avconvert`, which ships with macOS, can
scale but not crop.

Re-encodes measured with `avconvert`: 1280x716 is 8.1 MB, 960x536 is 5.2 MB,
640x356 is 2.6 MB, HEVC at 1080p is 7.6 MB and was rejected for patchy Chrome
support. At DPR 2 the 1280 lands at 2.25x, the same upscale as the still, so it
costs 8 MB to match a 56 KB photograph rather than beat it.

**To sharpen the phone further needs vertical pixels**, which means a 9:16
generation. Reframing the existing clip was priced and is poor value: 33 credits
at 480p, 48 at 720p, 93 at 1080p, against 17.5 for a fresh generation, and
reframe invents new edges rather than adding resolution.

### How it is used

`HeroVideo` mounts it over the still after hydration, fades it in, and honours
`prefers-reduced-motion`. The still is the LCP element and always paints first;
if the video never loads, the hero is the photograph. The grade is duplicated
onto the video so the handover is invisible.

**Contrast was re-measured against the video, not inherited from the still.** A
video is brighter in some frames than the frame it came from. Mean luminance
across the clip moves by about 1 level out of 255, so the still's numbers hold,
but re-measure against the brightest frame if the grade is ever lightened.
