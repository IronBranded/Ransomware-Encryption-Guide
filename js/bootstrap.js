// Bootstrap: fetches the 5 module fragments and the 2 shared data files,
// injects them into index.html's placeholder containers, THEN loads Alpine.js
// itself (its script tag isn't in index.html at all -- this file adds it).
// That ordering is what lets Alpine's normal auto-start behavior "just work"
// against a fully-assembled page, without depending on any particular
// version's defer/pause hooks. This is what lets each module and each data
// file live in its own editable file while still behaving, at runtime, like
// one page.
//
// Requires being served over http(s) -- fetch() cannot read local files from
// a file:// URL in most browsers. Run a local server to preview (see
// README.md), or deploy to GitHub Pages, which serves over https by default.

(function () {
  // File names use a hyphen (modules/module-1.html); container ids and
  // $store.shell.currentModule values don't (module1-container, 'module1').
  // Keep both forms explicit here rather than deriving one from the other by
  // string-mangling, which is exactly how this broke the first time.
  const MODULES = [
    { file: 'module-1', containerId: 'module1-container' },
    { file: 'module-2', containerId: 'module2-container' },
    { file: 'module-3', containerId: 'module3-container' },
    { file: 'module-4', containerId: 'module4-container' },
    { file: 'module-5', containerId: 'module5-container' },
    { file: 'reference', containerId: 'reference-container' },
  ];

  function fetchText(url) {
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(url + ' responded with ' + res.status);
      return res.text();
    });
  }

  function fetchJson(url) {
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(url + ' responded with ' + res.status);
      return res.json();
    });
  }

  function showFatalError(err) {
    console.error('DFIR guide failed to load:', err);
    const loading = document.getElementById('boot-loading');
    if (loading) {
      loading.innerHTML =
        '<div style="max-width:640px;margin:15vh auto;padding:0 24px;font-family:ui-monospace,monospace;color:#e2e8f0;">' +
        '<p style="color:#f43f5e;font-weight:600;margin-bottom:12px;">Could not load the guide.</p>' +
        '<p style="color:#94a3b8;line-height:1.6;margin-bottom:12px;">' + String(err.message || err) + '</p>' +
        '<p style="color:#94a3b8;line-height:1.6;">This page loads its modules with <code>fetch()</code>, which needs an http(s) origin. ' +
        'If you opened this file directly (a <code>file://</code> URL), that\'s almost always the cause. ' +
        'From this folder, run:</p>' +
        '<pre style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:12px 16px;margin-top:8px;color:#38bdf8;overflow-x:auto;">python3 -m http.server 8000</pre>' +
        '<p style="color:#94a3b8;line-height:1.6;">then open <code>http://localhost:8000</code>. Deployed on GitHub Pages, this loads normally.</p>' +
        '</div>';
    }
  }

  const ALPINE_SRC = 'https://unpkg.com/[email protected]/dist/cdn.min.js';

  function loadAlpine() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = ALPINE_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Alpine.js from ' + ALPINE_SRC));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    try {
      const [dataFetches, moduleFetches] = await Promise.all([
        Promise.all([
          fetchJson('data/family-profiles.json'),
          fetchJson('data/indicator-groups.json'),
          fetchJson('data/glossary.json'),
          fetchJson('data/sources.json'),
        ]),
        Promise.all(MODULES.map((m) => fetchText('modules/' + m.file + '.html'))),
      ]);

      const [familyData, indicatorData, glossaryData, sourcesData] = dataFetches;
      window.__DFIR_DATA__ = {
        familyProfiles: familyData.families || [],
        indicatorGroups: indicatorData.groups || [],
        glossary: glossaryData.groups || [],
        sources: sourcesData.groups || [],
      };

      MODULES.forEach((m, i) => {
        const container = document.getElementById(m.containerId);
        if (container) {
          container.innerHTML = moduleFetches[i];
        } else {
          console.error('bootstrap.js: no container found with id="' + m.containerId + '" for modules/' + m.file + '.html -- check index.html');
        }
      });

      // Alpine is not loaded until this exact point, on purpose: its script
      // tag doesn't exist in index.html at all. That guarantees Alpine's own
      // auto-start (whatever internal mechanism a given version uses) only
      // ever sees the fully-assembled DOM -- content already injected, and
      // every store/widget already registered via 'alpine:init' listeners.
      await loadAlpine();

      const loading = document.getElementById('boot-loading');
      if (loading) loading.remove();

      requestAnimationFrame(() => {
        if (window.lucide) lucide.createIcons();
      });
    } catch (err) {
      showFatalError(err);
    }
  }

  boot();
})();
