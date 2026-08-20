# Ransomware Encryption Guide (R.E.G)
_________

<h3 align="center">
  <a href="https://ironbranded.github.io/Ransomware-Encryption-Guide/" target="_blank" rel="noopener noreferrer">
    🟢 TRY THE GUIDE 🟢
  </a>
</h3>

________

A five-module interactive training site on ransomware encryption, built for DFIR
analysts. Static site, no build step — but modular, so a change to one module,
one widget, or one data file can't break anything else.

## Structure

```
index.html                    Page shell: nav, containers, boot sequence. Rarely edited.
sw.js                          Service worker -- offline caching. See "Offline support" below.
.github/workflows/validate.yml CI: runs the same checks documented below on every push.
css/styles.css                All custom CSS (design tokens live in js/tailwind.config.js instead).
js/
  tailwind.config.js          Color palette, fonts, shadows. Edit this to change the design system.
  bootstrap.js                Fetches modules/*.html + data/*.json, then starts Alpine once.
  store.shell.js               Nav, progress tracking, the ambient scanline. Shared by every module.
  store.data.js                Loads all four data/*.json files into $store.data.
  widgets/
    visualizer.js              Widget 1 (Module 1) -- Hybrid Encryption Visualizer. Self-contained.
    entropy.js                 Widget 2 (Module 2) -- Entropy & Magic Byte Inspector. Self-contained.
    decisionTree.js             Widget 3 (Module 3) -- Triage Decision Tree. Reads $store.data.
    reportBuilder.js            Widget 4 (Module 5) -- DFIR Report Builder. Reads $store.data.
    reference.js                Reference-page widget -- searchable glossary. Reads $store.data.
data/
  family-profiles.json         Ransomware family profiles used by Widgets 3 and 4.
  indicator-groups.json        Observable-indicator checklist used by Widget 3.
  glossary.json                 Plain-English term definitions for the Reference page.
  sources.json                  Every citation used across the guide, organized by category.
modules/
  module-1.html ... module-5.html  The actual course content, one file per module.
  reference.html                 Glossary & Sources page content. Not part of the module sequence.
```

## How it fits together

`index.html` is a shell with empty `<section id="...-container">` elements -- one
per numbered module, plus one for the reference page. On load, `js/bootstrap.js`
fetches all six `modules/*.html` fragments and all four `data/*.json` files in
parallel, injects the HTML into those containers, and only *then* starts
Alpine.js -- in one clean pass over the fully-assembled page. This is what makes
the split possible without a build step: every file is plain HTML/CSS/JS,
fetched at runtime, no bundler involved.

Each interactive widget is its own independent Alpine component
(`Alpine.data(...)`, registered in its own file under `js/widgets/`). A bug in the
entropy widget cannot reach into the decision tree widget -- they don't share
scope. The one thing every module *can* read is `$store.shell` (current module,
progress, nav) and `$store.data` (all four JSON files), both defined once and
shared deliberately.

The Glossary & Sources page is reachable from the sidebar but deliberately isn't
one of the five numbered "case files" -- it's reference material you'd dip into
at any point, not a step in the sequence, so it isn't numbered and doesn't
affect the progress bar.

## Sourcing

Every citation in this guide -- the NIST standards, the MITRE ATT&CK technique
IDs, the CISA advisories, the academic entropy-analysis paper, the vendor
threat intel -- was verified against the publisher's own site before being
added, not pulled from memory. The full list lives in `data/sources.json` and
renders on the Glossary & Sources page. A few things worth knowing if you
maintain this:

- **CISA advisory numbers and MITRE ATT&CK technique IDs are exact and
  checkable.** If you add a new one, verify it against `attack.mitre.org` or
  `cisa.gov/stopransomware` directly rather than reusing a number you recall --
  advisories get updated (see the LockBit and Play entries, both revised more
  than once) and technique IDs occasionally get restructured into
  sub-techniques.
- **NIST publications get superseded.** This guide cites SP 800-61 **Rev. 3**
  deliberately -- NIST withdrew Rev. 2 (the older "Computer Security Incident
  Handling Guide") in April 2025. Check `csrc.nist.gov` for the current version
  before citing a NIST pub by number.
- **Not every indicator or behavior has a clean ATT&CK mapping**, and that's
  fine -- `indicator-groups.json`'s `attack` field is optional. Forcing an
  inaccurate technique ID onto something is worse than leaving it untagged.

## Offline support

`sw.js` is a service worker that caches the whole app (HTML/CSS/JS/data) on
first visit, stale-while-revalidate style: cached responses return instantly,
and the network is still hit in the background to refresh the cache for next
time. After one successful online visit, the guide keeps working with no
connection at all -- deliberately useful for an analyst who wants this open
during an incident, which is exactly when a client network's internet is
least reliable.

It requires HTTPS or `localhost` (a browser security requirement for service
workers). A plain `http://` local preview from another machine won't register
one -- that's expected and harmless; the app doesn't depend on it succeeding.
Bump `CACHE_VERSION` in `sw.js` when you ship a change, so returning visitors
get the update instead of a stale cache.

## Continuous integration

`.github/workflows/validate.yml` runs on every push and pull request: JSON
validity, the indicator/family id-integrity check described above, that every
family has a source citation, HTML tag balance, JS syntax (including `sw.js`),
and that `sw.js`'s precache list and `bootstrap.js`'s module references still
match the real files on disk. All of this was previously "remember to run the
Python snippet from this README before pushing" -- now it just runs.

## Previewing locally

Because `bootstrap.js` uses `fetch()` to load the module fragments and JSON data,
opening `index.html` directly (a `file://` URL) will not work -- browsers block
`fetch()` from local files. Serve the folder over HTTP instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, VS Code's Live Server extension,
etc.). Deployed to GitHub Pages, this is a non-issue -- Pages always serves over
HTTPS.

## Deploying

Push this folder to a GitHub repo (root, or `/docs`) and enable Pages in repo
settings. No build step, no `npm install`, nothing to compile.

## Common updates

**Add a newly documented ransomware family to the decision tree:**
Edit `data/family-profiles.json` only. Add an object with a unique `id`, a
`name`, an `indicators` array (using ids that exist in
`data/indicator-groups.json`), a `scope` note, a `response`, and a `source`
(`title` + `url`, verified against the publisher's site -- see Sourcing above).
It will automatically appear in both the Module 3 decision tree *and* the
Module 5 report builder's family dropdown -- they read from the same file, so
they can't drift apart.

**Add a new observable indicator (API call, TTP, artifact) to check for:**
Edit `data/indicator-groups.json`, adding it to the relevant group. Include an
`attack` field (a verified MITRE ATT&CK technique ID) only if one genuinely
fits -- omit it otherwise. Reference the new indicator's `id` from any family's
`indicators` array in `family-profiles.json` if it should count toward that
family's match score.

**After editing either JSON file**, check that every id referenced in
`family-profiles.json`'s `indicators` arrays actually exists in
`indicator-groups.json` -- a typo there won't throw an error, it will just make
that indicator silently never match. A quick check:

```bash
python3 -c "
import json
fam = json.load(open('data/family-profiles.json'))['families']
ind = json.load(open('data/indicator-groups.json'))['groups']
defined = {i['id'] for g in ind for i in g['items']}
referenced = {i for f in fam for i in f['indicators']}
missing = referenced - defined
print('Missing ids:', missing or 'none')
"
```

**Add or edit a glossary term:** edit `data/glossary.json` -- add a term to an
existing group, or a new group if it doesn't fit the current three (Cryptography
basics / Windows & forensic artifacts / Threat intel & response vocabulary). No
JS changes needed; the Reference page's search covers new entries automatically.

**Add a citation:** edit `data/sources.json`, adding to the relevant category
(or a new one). Verify the URL and any specific numbers (advisory IDs,
publication dates) against the publisher's own site first.

**Update Module 4's case study as Microsoft (or others) publish more on
DeadLock:** edit `modules/module-4.html` only -- it's plain HTML, no JS, no
build. Same for any prose changes to Modules 1, 2, 3, or 5.

**Fix a bug in one widget's interactive behavior:** edit only that widget's file
under `js/widgets/`. None of the other widgets, the shell, or the module
content files need to change.

**Change the color palette or fonts:** edit `js/tailwind.config.js`. It's the
single source for the design system -- every page element derives its color from
the tokens defined there.

**Add a sixth module:** add an entry to the `modules` array in
`js/store.shell.js`, add a `<section id="module6-container" x-show="...">` to
`index.html`, add `{ file: 'module-6', containerId: 'module6-container' }` to
the `MODULES` array in `js/bootstrap.js`, and write `modules/module-6.html`.
