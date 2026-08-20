// Widget 1 -- Hybrid Encryption Visualizer (Module 1).
// Self-contained: no dependency on the shell store or any other widget.
// Safe to edit or replace without touching anything outside this file.
document.addEventListener('alpine:init', () => {
  Alpine.data('visualizer', () => ({
    visualizerStep: 0,
    visualizerRunning: false,
    visualizerStages: [{ short: 'Generate key' }, { short: 'Encrypt file' }, { short: 'Wrap key' }, { short: 'Purge RAM' }],
    keyDisplay: '',
    cipherDisplay: '',

    init() {
      this.keyDisplay = this.randHex(32);
      this.cipherDisplay = this.randHex(32);
    },

    randHex(len) {
      const chars = '0123456789abcdef';
      let s = '';
      for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
      return s;
    },

    resetVisualizer() {
      this.visualizerStep = 0;
      this.visualizerRunning = false;
      this.keyDisplay = this.randHex(32);
      this.cipherDisplay = this.randHex(32);
    },

    runVisualizer() {
      if (this.visualizerRunning) return;
      this.visualizerRunning = true;
      this.visualizerStep = 0;
      const advance = () => {
        this.visualizerStep++;
        if (this.visualizerStep === 1) this.keyDisplay = this.randHex(32);
        if (this.visualizerStep === 2) this.cipherDisplay = this.randHex(32);
        this.$nextTick(() => window.lucide && lucide.createIcons());
        if (this.visualizerStep < 4) setTimeout(advance, 900);
        else this.visualizerRunning = false;
      };
      setTimeout(advance, 400);
    },
  }));
});
