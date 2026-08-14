#!/usr/bin/env python3
"""Report which site/ files have changed since they were last uploaded to GitHub.

Why this exists: A uploads site files by hand through the GitHub web UI, because
the Cowork sandbox is proxy-blocked from api.github.com and cairnetint.com isn't
on the network allowlist. So neither git nor a fetch can tell us what's actually
live. This script tracks it instead.

How it works: `uploaded-state.json` records a hash of each file at the moment A
confirmed it was uploaded. This compares current hashes against that record.

Usage:
    python3 check-site-sync.py           report what changed
    python3 check-site-sync.py --mark    record current state as uploaded

Only run --mark after A confirms the upload actually happened. Marking without
uploading makes this file lie, which is worse than not having it.
"""
import hashlib, json, pathlib, sys

SITE = pathlib.Path(__file__).resolve().parent
STATE = SITE / 'uploaded-state.json'
# CNAME is deliberately excluded: it's already correct on the repo and
# re-uploading it triggers the 301 redirect problem documented in MEMORY.
SKIP = {'check-site-sync.py', 'uploaded-state.json', '.DS_Store', 'CNAME'}

def current():
    out = {}
    for f in sorted(SITE.iterdir()):
        if f.is_file() and f.name not in SKIP:
            out[f.name] = hashlib.sha256(f.read_bytes()).hexdigest()[:16]
    return out

def main():
    now = current()
    if '--mark' in sys.argv:
        STATE.write_text(json.dumps(now, indent=2) + '\n')
        print(f'Marked {len(now)} files as uploaded.')
        for n in now:
            print(f'  {n}')
        return 0

    was = json.loads(STATE.read_text()) if STATE.exists() else {}
    changed = [n for n, h in now.items() if was.get(n) != h]
    gone = [n for n in was if n not in now]

    if not changed and not gone:
        print('Site is in sync. Nothing to upload.')
        return 0

    print(f'{len(changed) + len(gone)} file(s) need attention on AHermiz/Cairnet:\n')
    for n in changed:
        print(f'  {"NEW  " if n not in was else "EDIT "} {n}')
    for n in gone:
        print(f'  DELETED LOCALLY  {n}  (remove it from the repo too)')
    print('\nUpload via github.com/AHermiz/Cairnet, "Add file" then "Upload files".')
    print('Do not re-upload CNAME. It is already correct and re-adding it causes')
    print('a 301 redirect that makes the site look broken.')
    print('\nOnce uploaded, run:  python3 check-site-sync.py --mark')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
