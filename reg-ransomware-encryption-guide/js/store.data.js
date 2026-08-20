// Shared reference data store. Populated by js/bootstrap.js (which fetches
// data/family-profiles.json, data/indicator-groups.json, data/glossary.json,
// and data/sources.json) before Alpine starts. The Decision Tree and Report
// Builder widgets read family names from here so the two can never drift out
// of sync; the Reference page reads glossary/sources from here directly.
document.addEventListener('alpine:init', () => {
  const loaded = window.__DFIR_DATA__ || { familyProfiles: [], indicatorGroups: [], glossary: [], sources: [] };
  Alpine.store('data', {
    familyProfiles: loaded.familyProfiles,
    indicatorGroups: loaded.indicatorGroups,
    glossary: loaded.glossary,
    sources: loaded.sources,
  });
});
