// Runs at the end of `npm run build`, locally and in CI.
//
// The one that bites people: public/CNAME has to survive into out/. If it does
// not, GitHub Pages forgets the custom domain and cairnetint.com serves a 404 on
// its own URL. That failure is silent at build time and loud in production, so it
// gets a check rather than a comment.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const DOMAIN = 'cairnetint.com';

const failures = [];

function check(label, fn) {
  try {
    const problem = fn();
    if (problem) failures.push(`${label}: ${problem}`);
    else console.log(`  ok   ${label}`);
  } catch (err) {
    failures.push(`${label}: ${err.message}`);
  }
}

check('out/ exists', () => (existsSync(OUT) ? null : 'the build produced no out/ directory'));

check(`out/CNAME reads exactly "${DOMAIN}"`, () => {
  const p = join(OUT, 'CNAME');
  if (!existsSync(p)) return 'missing. The custom domain will break on deploy.';
  const body = readFileSync(p, 'utf8').trim();
  return body === DOMAIN ? null : `reads "${body}"`;
});

check('out/index.html exists', () =>
  existsSync(join(OUT, 'index.html')) ? null : 'missing, so the site has no home page'
);

check('out/.nojekyll exists', () => {
  // Pages runs Jekyll by default, which strips directories beginning with an
  // underscore. Next.js puts every asset in _next/, so without this file the
  // deployed site loads no CSS and no JS.
  const p = join(OUT, '.nojekyll');
  return existsSync(p) ? null : 'missing, so Jekyll will strip the _next/ asset folder';
});

check('favicon and touch icon copied', () => {
  const missing = ['favicon.svg', 'apple-touch-icon.png'].filter(
    (f) => !existsSync(join(OUT, f))
  );
  return missing.length ? `missing ${missing.join(', ')}` : null;
});

if (failures.length) {
  console.error('\nBuild output check failed:\n');
  for (const f of failures) console.error(`  FAIL ${f}`);
  console.error('');
  process.exit(1);
}

console.log('\nBuild output checks passed.\n');
