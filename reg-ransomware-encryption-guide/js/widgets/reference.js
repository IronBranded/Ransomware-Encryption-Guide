// Reference page widget (Glossary & Sources) -- self-contained except for
// reading glossary/sources data from $store.data, populated from
// data/glossary.json and data/sources.json by js/bootstrap.js.
document.addEventListener('alpine:init', () => {
  Alpine.data('reference', () => ({
    query: '',

    get filteredGlossary() {
      const groups = this.$store.data.glossary || [];
      const q = this.query.trim().toLowerCase();
      if (!q) return groups;
      return groups
        .map((g) => ({
          name: g.name,
          terms: g.terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)),
        }))
        .filter((g) => g.terms.length > 0);
    },

    get resultCount() {
      return this.filteredGlossary.reduce((sum, g) => sum + g.terms.length, 0);
    },
  }));
});
