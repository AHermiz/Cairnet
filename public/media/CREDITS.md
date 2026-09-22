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

## Planned: hero-cairn-loop.mp4

Not generated. Written 2026-09-20 so the spend is a single decision rather than a
round of prompt drafting once credits exist.

**Model: Kling v3.0, `pro`, 5 seconds, silent, 16:9. 8.75 credits.**

Seedance 2.5 was the model originally named and it is four times the price for
the same five seconds: 35 credits at 720p against Kling's 8.75. Preflighted, not
estimated. Kling also takes a start frame **and** an end frame, and Seedance's
`omni_reference` mode takes only a start. That matters more than the price here:
a hero loops forever, so feeding the same still to both ends is what stops the
loop point from visibly cutting.

**Both frames: `hero-cairn-2400.webp`**, roles `start_image` and `end_image`.

### Prompt

> Slow, continuous atmospheric motion in a still landscape. The sea of cloud
> below drifts gently and billows very slowly. Thin mist curls up around the base
> of the cliff and thins out again. The grass on the plateau moves a little in
> the wind. Light shifts almost imperceptibly as cloud passes in front of the sun.
> The walker stands still, looking out over the cloud, shifting weight only
> slightly. The stone cairn does not move at all. The camera is nearly locked off
> with only the faintest drift. No zoom, no cut, no pan, no camera shake, no new
> subjects entering frame, no birds, no text. Calm, quiet, cinematic, and it must
> return to where it started.

The last clause is load bearing. With a matched start and end frame the model
still needs telling that the motion resolves rather than travels.

### What to check before accepting it

1. **The loop point.** Play it twice through and watch the seam.
2. **The cairn.** If the stones drift or re-form, it is unusable. That is the one
   object on the page the brand cannot have behaving like a generated artifact.
3. **The walker.** Standing and looking out is believable. Walking, or turning to
   face camera, breaks the faceless rule.
4. **Contrast.** The current grade is `saturate(0.55) contrast(1.02)
   brightness(0.72)` and the phone lede sits at 4.77 against a 4.5 floor. A video
   is brighter in some frames than the still it came from, so re-measure against
   the brightest frame, not the first one.
5. **Weight.** The still set is 196 KB. A 5s 1080p loop will be an order of
   magnitude more, and the hero is the LCP element. Budget for a poster frame and
   `preload="none"` if it lands heavy.
