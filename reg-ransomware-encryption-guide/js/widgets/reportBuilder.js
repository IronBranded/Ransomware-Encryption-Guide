// Widget 4 -- DFIR Report Builder (Module 5).
// reportFamilyOptions derives from $store.data.familyProfiles instead of a
// separately hand-typed list, so this dropdown and the Decision Tree widget
// can never quietly drift apart when a family gets added or renamed.
document.addEventListener('alpine:init', () => {
  Alpine.data('reportBuilder', () => ({
    report: { org: '', analyst: '', date: '', family: 'Other / Unidentified', scheme: 'Unknown — under analysis', keyStatus: 'No recovery path identified', vector: 'Phishing', systems: '', exfil: 'Unknown', notes: '' },
    reportCopied: false,

    get reportFamilyOptions() {
      const names = (this.$store.data.familyProfiles || []).map(f => f.name);
      return names.concat('Other / Unidentified');
    },

    get generatedReport() {
      const r = this.report;
      const org = r.org || '[Organization name]';
      const analyst = r.analyst || '[Analyst name]';
      const date = r.date || '[Discovery date]';
      const systems = r.systems || '[systems/scope not yet quantified]';

      const remediation = {
        'No recovery path identified': '- Restore affected systems from offline/immutable backups where available.\n- Do not assume payment guarantees a working decryptor; treat it as a business decision made with legal counsel, not a technical certainty.\n- Preserve encrypted samples and a ransom note copy for law enforcement.',
        'Partial — some files recoverable via VSS or backups': '- Prioritize restoration from confirmed-intact Volume Shadow Copies and backups.\n- Scope exactly which systems/shares retained recoverable shadow copies before wider restoration planning.\n- Continue evidence preservation on systems without a recovery path.',
        'Full — implementation flaw identified': '- Validate the recovery method on copies of encrypted data before running it against production/original files.\n- Document the flaw and recovery method for the incident record.\n- Still pursue standard IR steps (access revocation, credential rotation) — a decryptor does not address root cause.',
        'Under investigation': '- Preserve current state and avoid actions that could complicate a later determination (e.g. reformatting affected disks).\n- Prioritize memory and disk imaging while investigation is ongoing.',
      };

      return '# DFIR Incident Summary\n\n' +
        '**Organization:** ' + org + '\n' +
        '**Analyst:** ' + analyst + '\n' +
        '**Discovery date:** ' + date + '\n' +
        '**Ransomware family:** ' + r.family + '\n\n' +
        '## Executive Summary\n' +
        org + ' identified a ransomware encryption event attributed to indicators consistent with **' + r.family + '**. Initial access is currently assessed as **' + r.vector + '**. Systems affected: ' + systems + '. Data exfiltration status: **' + r.exfil + '**. This summary reflects the investigation\'s current state and will be updated as findings are confirmed.\n\n' +
        '## Incident Timeline\n' +
        '- **' + date + '** — Encryption activity discovered / triage initiated.\n' +
        '- _(Populate with confirmed timestamps from MFT, USN Journal, and log analysis — see Module 5.)_\n\n' +
        '## Technical Findings\n' +
        '- **Initial access vector:** ' + r.vector + '\n' +
        '- **Ransomware family:** ' + r.family + '\n' +
        '- **Cryptographic scheme:** ' + r.scheme + '\n' +
        '- **Key recovery status:** ' + r.keyStatus + '\n\n' +
        '## Cryptographic Analysis\n' +
        'Encryption is assessed as a hybrid scheme (' + r.scheme + '). ' + (r.keyStatus === 'No recovery path identified' ? 'No implementation weakness has been identified; brute-force recovery of the session key is not considered feasible.' : r.keyStatus) + '\n\n' +
        '## Scope of Impact\n' +
        '- **Systems affected:** ' + systems + '\n' +
        '- **Data exfiltration:** ' + r.exfil + '\n\n' +
        '## Recommended Actions\n' +
        (remediation[r.keyStatus] || remediation['No recovery path identified']) + '\n\n' +
        '## Legal & Regulatory Considerations\n' +
        '- Assess breach notification obligations under applicable law with legal counsel.\n' +
        '- Consider engagement with law enforcement (e.g. local CERT / FBI IC3 where applicable).\n' +
        '- If ransom payment is under consideration, note that sanctions exposure can depend on threat-actor attribution — involve legal counsel before any payment decision. This section is informational, not legal advice.\n' +
        (r.notes ? '\n## Additional Notes\n' + r.notes + '\n' : '') +
        '\n---\n*Generated with Ransomware Encryption Guide (R.E.G) — an interactive DFIR field guide. Verify all fields before distribution.*';
    },

    copyReport() {
      const text = this.generatedReport;
      const done = () => {
        this.reportCopied = true;
        this.$nextTick(() => window.lucide && lucide.createIcons());
        setTimeout(() => { this.reportCopied = false; this.$nextTick(() => window.lucide && lucide.createIcons()); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done));
      } else {
        this.fallbackCopy(text, done);
      }
    },

    fallbackCopy(text, cb) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        cb();
      } catch (e) { /* clipboard unavailable in this context */ }
    },
  }));
});
