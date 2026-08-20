// Widget 3 -- Windows Triage Decision Tree (Module 3).
// Reads indicatorGroups and familyProfiles from $store.data (populated from
// data/*.json by js/bootstrap.js) rather than holding its own copy, so this
// widget and the Report Builder can never disagree about family names.
document.addEventListener('alpine:init', () => {
  Alpine.data('decisionTree', () => ({
    selectedIndicators: [],

    toggleIndicator(id) {
      const i = this.selectedIndicators.indexOf(id);
      if (i === -1) this.selectedIndicators.push(id); else this.selectedIndicators.splice(i, 1);
      // Match cards (and their external-link icons) are created fresh by x-for
      // each time this list changes -- those new icon elements didn't exist
      // yet during the one-time createIcons() pass at page load, so re-run it.
      this.$nextTick(() => window.lucide && lucide.createIcons());
    },

    get matchedFamilies() {
      if (!this.selectedIndicators.length) return [];
      const families = this.$store.data.familyProfiles || [];
      return families
        .map(f => {
          const hit = f.indicators.filter(i => this.selectedIndicators.includes(i)).length;
          return Object.assign({}, f, { score: hit / f.indicators.length });
        })
        .filter(f => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    },
  }));
});
