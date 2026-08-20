// Design-system tokens for the whole site. This is the one place to change
// the color palette, font stack, or shadow values -- every page uses this file.
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          base: '#0f172a',
          surface: '#1e293b',
          surface2: '#253449',
          edge: '#334155',
          accent: { DEFAULT: '#38bdf8', dim: '#0ea5e9' },
          danger: { DEFAULT: '#f43f5e', dim: '#e11d48' },
          success: { DEFAULT: '#10b981', dim: '#059669' },
          warn: { DEFAULT: '#f59e0b', dim: '#d97706' },
          ink: '#e2e8f0',
          muted: '#94a3b8',
          // faint (#64748b) fails WCAG AA (2.65-3.75:1) for text at every
          // surface in this palette -- it's only used for borders/hover
          // states (3:1 threshold, which it passes), never for text. Use
          // `muted` instead if you need a text color, which passes at 4.5:1+
          // everywhere it's used.
          faint: '#64748b',
        },
        fontFamily: {
          display: ['"Space Grotesk"', 'sans-serif'],
          body: ['"IBM Plex Sans"', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'monospace'],
        },
        boxShadow: {
          edge: '0 0 0 1px #334155',
        },
      },
    },
  };
} else {
  console.warn('Tailwind failed to load from CDN -- the page will render unstyled. Check network access to cdn.tailwindcss.com.');
}
