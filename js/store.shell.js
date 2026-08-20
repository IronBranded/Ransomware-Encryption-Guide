// Shell store: navigation, per-module completion, and the ambient scanline.
// This is the ONLY state shared across module boundaries. Each widget's own
// state lives in js/widgets/*.js and is never touched from here -- a bug in
// one widget cannot reach into another widget or into this store.
document.addEventListener('alpine:init', () => {
  Alpine.store('shell', {
    mobileNavOpen: false,
    currentModule: 'module1',

    // Editing the course outline (add/remove/reorder a module) only ever
    // requires touching this one array -- nothing else references module
    // metadata directly.
    modules: [
      { id: 'module1', num: '01', title: 'Fundamentals', tag: 'encryption basics' },
      { id: 'module2', num: '02', title: 'Identification', tag: 'artifacts & entropy' },
      { id: 'module3', num: '03', title: 'Windows triage', tag: 'APIs & evasion' },
      { id: 'module4', num: '04', title: 'Case studies', tag: 'DeadLock & The Gentlemen' },
      { id: 'module5', num: '05', title: 'DFIR & reporting', tag: 'evidence & reports' },
    ],

    progress: { module1: false, module2: false, module3: false, module4: false, module5: false },

    get progressPercent() {
      const vals = Object.values(this.progress);
      return Math.round((vals.filter(Boolean).length / vals.length) * 100);
    },

    navigateTo(id) {
      this.currentModule = id;
      this.mobileNavOpen = false;
      try { window.location.hash = id; } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'auto' });
      Alpine.nextTick(() => window.lucide && lucide.createIcons());
    },

    markComplete(id) {
      this.progress[id] = true;
      this.saveProgress();
    },

    saveProgress() {
      try { localStorage.setItem('dfir-guide-progress', JSON.stringify(this.progress)); } catch (e) { /* storage unavailable in this context */ }
    },

    loadProgress() {
      try {
        const raw = localStorage.getItem('dfir-guide-progress');
        if (raw) Object.assign(this.progress, JSON.parse(raw));
      } catch (e) { /* storage unavailable in this context */ }
    },

    noiseCells: [],
    buildNoise() {
      const palette = ['#38bdf8', '#10b981', '#f43f5e', '#f59e0b', '#334155', '#334155'];
      const cells = [];
      for (let i = 0; i < 72; i++) {
        cells.push({ color: palette[Math.floor(Math.random() * palette.length)], delay: (Math.random() * 3).toFixed(2) });
      }
      this.noiseCells = cells;
    },

    initShell() {
      this.loadProgress();
      this.buildNoise();
      try {
        const hash = window.location.hash.replace('#', '');
        const validTargets = this.modules.map((m) => m.id).concat('reference');
        if (validTargets.includes(hash)) this.currentModule = hash;
      } catch (e) {}
    },
  });

  Alpine.store('shell').initShell();
});
