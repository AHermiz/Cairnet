import { ArrowDown } from 'lucide-react';
import { QUESTIONS_CALL, howItWorks, services } from '@/lib/content';
import Button from './Button';
import Reveal from './Reveal';
import ServiceFolder, { type FolderFile } from './ServiceFolder';

/**
 * The other three folders' photographs, in service order. Sources in
 * public/media/CREDITS.md. Each shows as a small 4:3 print tucked into its
 * folder, so each position is set by eye to keep the subject in that crop.
 */
const folderPhotos = [
  { name: 'folder-website', position: 'center 40%' },
  { name: 'folder-autopilot', position: 'center 55%' },
  { name: 'folder-frontdesk', position: 'center 62%' },
];

/**
 * The four services, as four folders. Charcoal ground, like the rest of the page
 * since 2026-11-02.
 *
 * **Folders, not cards (A, 2026-11-02).** A wanted this section livelier and
 * picked the 21st.dev glass folders out of ten references. Each folder's front
 * carries what the card used to: the name, the promise and the short
 * description. Opening it does what "What's included" did, and the included
 * lines are grouped into three files per service, so a reader opens three things
 * rather than twenty-odd. Every line is the existing copy, word for word.
 *
 * **Not four identical tiles.** Assessment is the front door and the other three
 * are what an assessment turns up. Its folder is the light one, using the brand's
 * second ground rather than a badge or a highlight colour, and it carries the
 * Statement family's edge blaze, the one red mark in this section. On Off-White
 * Signal measures 4.48:1, past the 3:1 a graphic needs.
 *
 * **The Assessment folder repeats How an assessment runs.** Its files are the
 * section's steps, said in fewer clicks. A accepted the repetition: the folder is
 * the quick look, the section is the long read. If it grates once seen, the
 * folder can hold just the three beats and link down.
 *
 * **No assessment CTA in this section.** The nav and the hero already carry the
 * one label this site uses to ask for the sale, and the close asks again. The
 * other three folders each offer a ghost button for that service, never Signal,
 * so the filled button stays the assessment's.
 *
 * Body copy is Mist, never Stone. Stone is 4.72:1 on flat charcoal and fails on a
 * raised surface; Mist is 9.98:1 and is the tier that exists for this job.
 */
export default function Services() {
  const [frontDoor, ...rest] = services.items;
  const steps = howItWorks.steps;

  const frontDoorFiles: FolderFile[] = [
    { name: steps[0].title, meta: steps[0].meta, blocks: [{ p: steps[0].body }] },
    {
      // No time on this tab: the name is long enough to be cut off by one, and
      // "within 2 business days" is already on the folder's front.
      name: services.researchFile,
      blocks: [
        { p: steps[1].body },
        { p: steps[2].body },
        { heading: howItWorks.reportHeading, list: howItWorks.report },
      ],
    },
    { name: steps[3].title, meta: steps[3].meta, blocks: [{ p: steps[3].body }] },
  ];

  return (
    <section id="services" className="bg-charcoal py-frame">
      <div className="frame">
        <Reveal>
          <div className="max-w-prose">
            <h2 className="text-3xl font-bold tracking-claim text-offwhite">{services.heading}</h2>
            <p className="mt-5 text-lg leading-body text-mist">{services.lede}</p>
          </div>
        </Reveal>

        {/* No row gap beyond the folders' own headroom: each one reserves the
            space its files fan into when it opens. */}
        <div className="mt-6 grid gap-x-8 gap-y-4 lg:grid-cols-2">
          <ServiceFolder
            tone="light"
            blaze
            photo="folder-assessment"
            photoPosition="center"
            name={frontDoor.name}
            promise={frontDoor.promise}
            toggleLabel={services.detailLabel}
            files={frontDoorFiles}
            closed={<p className="text-base leading-body">{frontDoor.body}</p>}
            open={
              <div>
                <ul className="space-y-3">
                  {services.frontDoorBeats.map((beat) => (
                    <li key={beat} className="flex gap-3 text-base leading-body text-charcoal">
                      <span aria-hidden className="mt-[0.55em] h-[3px] w-4 shrink-0 rounded-brand bg-slate" />
                      {beat}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm font-bold tracking-label text-charcoal">
                  Implementation is quoted separately.
                </p>
                <a
                  href="#how-it-works"
                  className="mt-4 inline-flex items-center gap-2 rounded-brand text-base font-bold text-charcoal underline decoration-stone underline-offset-4 transition-colors duration-200 ease-state hover:decoration-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
                >
                  {frontDoor.cue}
                  <ArrowDown aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                </a>
              </div>
            }
          />

          {rest.map(
            (item, i) =>
              item.detail && (
                <ServiceFolder
                  key={item.name}
                  delay={(i + 1) * 140}
                  photo={folderPhotos[i].name}
                  photoPosition={folderPhotos[i].position}
                  name={item.name}
                  promise={item.promise}
                  toggleLabel={services.detailLabel}
                  files={item.detail.included.map((group) => ({
                    name: group.file,
                    blocks: [{ list: group.lines }],
                  }))}
                  closed={<p className="text-base leading-body">{item.body}</p>}
                  open={
                    <div>
                      <p className="text-base leading-body">{item.detail.what}</p>
                      <Button href={QUESTIONS_CALL} variant="ghost" className="mt-6">
                        {item.detail.ask}
                      </Button>
                    </div>
                  }
                />
              ),
          )}
        </div>
      </div>
    </section>
  );
}
