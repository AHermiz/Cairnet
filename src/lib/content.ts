/**
 * Every visible string on the site.
 *
 * Almost all of it is lifted from approved, voice-checked copy in the brand and
 * offer folders rather than written fresh: the Facebook and LinkedIn About
 * sections, offer/how-it-works(assessment).md, and offer/prices-services.md. Where
 * a line is new it follows the same rules. No dashes as punctuation, American
 * spelling, contractions by default, typographic apostrophes rather than straight
 * ticks, nothing that signals headcount or that there is no first client yet, and
 * no prices.
 *
 * The source files were written before the contraction rule landed in
 * voice/style-guide.md on 2026-09-16, so their long forms are contracted here.
 * Refusals keep the long form, which is where the separate words carry the weight.
 */

export const EMAIL = 'contact@cairnetint.com';
export const MAILTO = `mailto:${EMAIL}?subject=Assessment`;

/** One label per intent. This string is the only way the site asks for the sale. */
export const CTA = 'Start with an assessment';

export const nav = [
  { label: 'Where to start', href: '#services' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Questions', href: '#questions' },
];

export const hero = {
  claimSetup: 'Most businesses don’t need AI.',
  claimPayoffLead: 'They need ',
  claimAccent: 'one specific thing',
  claimPayoffRest: ' fixed.',
  lede: 'We find that thing, then we build it. No jargon, no 6-month program, and no technology you’ll never touch again.',
};

export const services = {
  heading: 'Where to start',
  lede: 'If you already know exactly what you want built, go straight to it. If you don’t, start with an assessment. The other 3 are usually what it turns up.',
  /**
   * The front door card carries these three beats as well as its body copy.
   * Straight out of how-it-works(assessment).md: "One conversation, a written
   * plan, and a call to walk you through it." Written here as three lines
   * because the card is the tallest thing in the section and needs to earn the
   * height rather than sit half empty.
   */
  frontDoorBeats: [
    'A 30-minute conversation about how your week actually goes.',
    'A written plan, in your hands within 2 business days.',
    'A call to walk you through it, and it’s yours to keep either way.',
  ],
  items: [
    {
      name: 'Cairnet Assessment',
      promise: 'Where AI would genuinely help.',
      body: 'A clear read on how you work now, what’s eating your week, and what to do about it. Some of what we recommend won’t be AI at all, and we’ll say so.',
      frontDoor: true,
    },
    {
      name: 'Cairnet Website',
      promise: 'Get found and look legitimate.',
      body: '5 to 7 pages that work on a phone, with the copy written for you and a booking or contact form wired up. New builds, refreshes, and showing up in local search.',
    },
    {
      name: 'Cairnet Autopilot',
      promise: 'The repetitive work, handled.',
      body: 'The jobs done by hand every week that a machine should have been doing all along. We map what actually happens, cut it back to the steps that earn their place, then automate what’s left.',
    },
    {
      name: 'Cairnet Front Desk',
      promise: 'Answers customers around the clock.',
      body: 'An assistant trained on your own material, your pricing and your policies, with clear rules about what it must never say. Questions, bookings and quote requests, at 9pm on a Sunday.',
    },
  ],
};

export const howItWorks = {
  heading: 'How an assessment runs',
  lede: 'Most owners already know something in their week is eating time they don’t have. What they don’t have is a free afternoon to work out which tools fix it, which ones are worth paying for, and which are a distraction with good marketing. That’s the whole job.',
  /**
   * Added 2026-09-20. "How it works" sits right under the four services and was
   * reading as though an assessment is the only way in. It is the front door, not
   * the only door, and someone who already knows what they want should not have
   * to buy a diagnosis first. Same sentiment as the services lede, said once more
   * where the funnel narrows.
   */
  note: 'This is the front door, not the only one. If you already know what you want built, skip it and we’ll quote that instead.',
  steps: [
    {
      title: 'A conversation',
      meta: '30 minutes',
      body: 'We ask about your week. What you do every Monday without fail, what slips through the cracks, what you’d hand to a new hire tomorrow if you had one. No pitch, and no tool recommendations on the call. We’d rather understand how you actually work before saying anything about how you should.',
    },
    {
      title: 'We go and do the research',
      meta: 'Our time, not yours',
      body: 'Every problem you raised gets matched against what’s actually out there, with the price checked and the setup time worked out. If a $42 dashboard fixes it, that’s the answer, and we’ll tell you so.',
    },
    {
      title: 'Your assessment',
      meta: 'Within 2 business days',
      body: 'A written report, yours to keep whether or not we ever work together again.',
    },
    {
      title: 'A walkthrough',
      meta: '30 minutes',
      body: 'We send the report over first so you can read it on your own time, then we get on a call and go through it together. You ask what came up, we answer, and if there’s something you want help with, we talk about that too.',
    },
  ],
  reportHeading: 'What the report covers',
  report: [
    'Where your time is going, described the way you described it',
    'Every fix plotted by payoff against effort, so you can see what’s worth doing first and what can wait',
    'The actual tools, named, with real monthly costs and honest setup times',
    'A 4-day plan to get the quick wins running this week',
    'What all of it is worth to you every month, in hours and in dollars',
  ],
  /**
   * Reworded 2026-09-20. The old version ended "we're not worried about it",
   * which reads as arrogance dressed as confidence. The point is not that we can
   * afford to lose the work. It is that an owner who is paying to get time back
   * does not then have time to research tools, learn them and stand them up.
   * Say the reason, not the posture.
   */
  reportNote:
    'You could take that report and do every bit of it yourself. That’s a real option, and it’s written so you can. It is also a second job. Working out which tools, learning them, and getting them running takes exactly the time you were trying to get back.',
};

export const faq = {
  heading: 'Questions people ask first',
  items: [
    {
      q: 'What if the answer is that we don’t need AI?',
      a: 'Then that’s the answer, and you’ll get it in writing. A lot of what turns up in an assessment isn’t AI at all. A setting nobody changed. A form that asks for too much. A job 2 people are both doing. An honest list includes the ones we can’t charge you for.',
    },
    {
      q: 'What does it cost?',
      a: 'The assessment is a flat fee and you’ll know the number before you book anything. Everything after it is quoted separately, and those prices are written into your report. So by the time we’re on the walkthrough call, you already know what you’re looking at.',
    },
    {
      q: 'What do I actually have to do?',
      a: 'Talk for 30 minutes about how your week really goes, then read a report. That’s the whole ask. Nothing to fill in beforehand, no access to your systems, and nothing to prepare.',
    },
    {
      q: 'Can we just do it ourselves afterward?',
      a: 'Yes, and the report is written so you can. It names the tools, the costs and the order to do them in, and there’s a 4-day plan at the back. Some owners run it themselves. Some would rather the quick wins were already working by Friday, and we’ll do that part for you.',
    },
    {
      q: 'Do we have to be local?',
      a: 'No. The work runs on email and calls, so where you are doesn’t decide whether we can help.',
    },
    {
      q: 'We tried something like this and it didn’t stick. Why is this different?',
      a: 'Usually one of 4 things. The tool got bought before anyone worked out what it was supposed to fix. Or the process was automated as-is, so a 15-step mess that should have been 8 just ran faster. Or it needed someone to keep it running and nobody owned that. Or it worked, and then the one person who understood it left. None of those are the technology failing. We go looking for which one is about to happen before anything gets built, and the report names it in writing so it isn’t a surprise 6 months later.',
    },
  ],
};

export const closing = {
  heading: 'Your next move, marked in stone.',
  body: 'A cairn is a stack of stones marking a trail through unfamiliar ground. It doesn’t tell you about the whole mountain. It tells you where to step next. That’s the job here.',
};

export const footer = {
  tagline: 'Your next move, marked in stone.',
  area: 'Based in the GTA, available anywhere a call reaches.',
};
