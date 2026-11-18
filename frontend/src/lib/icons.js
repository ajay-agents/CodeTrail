const ICON = {
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.6" fill="currentColor"/><path d="M5.5 7V5.3a2.5 2.5 0 015 0V7" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  left: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.6V8l2.3 1.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  head: '<svg class="head" viewBox="0 0 58 48" aria-hidden="true"><ellipse cx="29" cy="28" rx="25" ry="17" style="fill:var(--blue)"/><path d="M29 12l5 6-5 6-5-6z" style="fill:var(--yellow)"/><circle cx="19" cy="27" r="6.5" fill="#fff"/><circle cx="39" cy="27" r="6.5" fill="#fff"/><circle cx="20.5" cy="28" r="3" fill="#16273B"/><circle cx="37.5" cy="28" r="3" fill="#16273B"/></svg>'
};
const LOGO = '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#2F5F8F"/><path d="M10 9.5c10 0 12 3.5 7 7.5s-3 7.5 7.5 7.5" fill="none" stroke="#FFD43B" stroke-width="3.6" stroke-linecap="round"/><circle cx="24.5" cy="24.5" r="2.4" fill="#FFD43B"/></svg>';

/* ---------- icon set (custom line icons) ---------- */
const IC = {
  terminal: '<rect class="f" x="3" y="4" width="18" height="16" rx="3"/><path d="M7.5 9.5l3 2.5-3 2.5M13 15h4"/>',
  tag: '<path class="f" d="M3 12.2V5a2 2 0 012-2h7.2a2 2 0 011.4.6l7.8 7.8a2 2 0 010 2.8l-6.2 6.2a2 2 0 01-2.8 0L3.6 13.6A2 2 0 013 12.2z"/><circle cx="8" cy="8" r="1.4"/>',
  branch: '<circle class="f" cx="6" cy="5" r="2"/><circle class="f" cx="6" cy="19" r="2"/><circle class="f" cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-4 5-9 7"/>',
  repeat: '<path d="M4 11V9a3 3 0 013-3h11"/><path d="M15 3l3 3-3 3"/><path d="M20 13v2a3 3 0 01-3 3H6"/><path d="M9 21l-3-3 3-3"/>',
  braces: '<path d="M9 4C7 4 6.5 5 6.5 6.5v2C6.5 10 5.5 11 4 12c1.5 1 2.5 2 2.5 3.5v2C6.5 19 7 20 9 20M15 4c2 0 2.5 1 2.5 2.5v2c0 1.5 1 2.5 2.5 3.5-1.5 1-2.5 2-2.5 3.5v2c0 1.5-.5 2.5-2.5 2.5"/>',
  layers: '<path class="f" d="M12 2.5l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 16.5l9 5 9-5"/>',
  cube: '<path class="f" d="M12 2.5l8.5 4.7v9.6L12 21.5l-8.5-4.7V7.2L12 2.5z"/><path d="M12 12l8.5-4.8M12 12L3.5 7.2M12 12v9.5"/>',
  rocket: '<path class="f" d="M14.5 4.5c3-1.4 5-1.5 5-1.5s-.1 2-1.5 5l-5.5 5.5-3-3L14.5 4.5z"/><path d="M8.5 10.5L5 11l-1.5 2.5 3.5.5M13.5 15.5L13 19l-2.5 1.5-.5-3.5M6.5 17.5c-1 .7-1.7 2-2 3.5 1.5-.3 2.8-1 3.5-2"/><circle cx="15.5" cy="8.5" r="1.3"/>',
  rows: '<rect class="f" x="3" y="5" width="18" height="5" rx="1.5"/><rect x="3" y="14" width="18" height="5" rx="1.5"/><path d="M9 5v5M15 5v5M9 14v5M15 14v5"/>',
  pointer: '<path class="f" d="M5 3l14 7.5-6 1.8L11 19 5 3z"/>',
  package: '<path class="f" d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7L12 2.5z"/><path d="M3.5 7L12 11.5 20.5 7M12 11.5v10M7.8 4.8l8.5 4.6"/>',
  wrench: '<path class="f" d="M15 4.5a4 4 0 00-3.7 5.4L4.4 16.8a2 2 0 002.8 2.8l6.9-6.9A4 4 0 0019.5 9l-2.6 2.6-2.5-.5-.5-2.5L16.5 6A4 4 0 0015 4.5z"/>',
  globe: '<circle class="f" cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z"/>',
  chart: '<rect class="f" x="4" y="12" width="4" height="8" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect class="f" x="16" y="9" width="4" height="11" rx="1"/>',
  ai: '<path class="f" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/>',
  cpu: '<rect class="f" x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  server: '<rect class="f" x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  cap: '<path class="f" d="M12 4L2.5 9 12 14l9.5-5L12 4z"/><path d="M6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M21.5 9v6"/>',
  gamepad: '<rect class="f" x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>',
  bolt: '<path class="f" d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z"/>',
  flame: '<path class="f" d="M12 2.5c.5 3-1.5 4.5-3 6.5-1.3 1.8-2 3.3-2 5.5a5 5 0 0010 0c0-2-.8-3.4-2-4.8-.3 1-.9 1.7-1.7 2 .4-2.4-.2-6.2-1.3-9.2z"/>',
  star: '<path class="f" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>',
  mountain: '<path class="f" d="M2.5 19l6.5-11 4 6.5 2-3 6.5 7.5H2.5z"/>',
  trophy: '<path class="f" d="M7.5 4h9v5a4.5 4.5 0 01-9 0V4z"/><path d="M7.5 5.5H4v1.5a3.5 3.5 0 003.5 3.5M16.5 5.5H20V7a3.5 3.5 0 01-3.5 3.5M12 13.5V17M8.5 20h7M10 17h4v3h-4z"/>',
  target: '<circle class="f" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  book: '<path class="f" d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 006.5 18H20v3H6.5A2.5 2.5 0 014 20.5z"/>',
  check: '<circle class="f" cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8 5.4-5.8"/>',
  flag: '<path d="M5 21V4"/><path class="f" d="M5 4h12l-2.5 4 2.5 4H5"/>',
  lock: '<rect class="f" x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>',
  sprout: '<path d="M12 21v-9"/><path class="f" d="M12 12c0-4 2.5-6.5 7-6.5 0 4-2.5 6.5-7 6.5z"/><path class="f" d="M12 14.5c0-3-2-5-5.5-5 0 3 2 5 5.5 5z"/>',
  compass: '<circle class="f" cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>'
};
Object.assign(IC, {
  search: '<circle class="f" cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  sort: '<path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3"/>',
  tree: '<circle class="f" cx="12" cy="5" r="2.5"/><circle class="f" cx="6" cy="18" r="2.5"/><circle class="f" cx="18" cy="18" r="2.5"/><path d="M12 7.5V12M12 12L6 15.5M12 12l6 3.5"/>',
  hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
  package: '<path class="f" d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7L12 2.5z"/><path d="M3.5 7L12 11.5 20.5 7M12 11.5v10"/>',
  reset: '<path d="M4 12a8 8 0 108-8 8 8 0 00-5.7 2.4L4 8.7"/><path d="M4 4v4.7h4.7"/>',
  coffee: '<path class="f" d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5V9z"/><path d="M16 10h1.5a2.5 2.5 0 010 5H16M8 3c0 1.5 1.5 1.5 1.5 3M12 3c0 1.5 1.5 1.5 1.5 3"/>',
  database: '<ellipse class="f" cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  atom: '<circle class="f" cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>',
  table: '<rect class="f" x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M3 14.5h18M9.5 4v16"/>',
  filter: '<path class="f" d="M3 4.5h18l-7 8.2V19l-4 2v-8.3L3 4.5z"/>',
  sigma: '<path d="M18 5H7l6 7-6 7h11"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  pencil: '<path class="f" d="M4 20l1-4.5L16.5 4a2.1 2.1 0 013 3L8 18.5 4 20z"/><path d="M14.5 6l3.5 3.5"/>',
  toggle: '<rect class="f" x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="16.5" cy="12" r="3"/>',
  cloud: '<path class="f" d="M7 18a4.5 4.5 0 01-.6-8.97A6 6 0 0118 10.5 3.75 3.75 0 0117.25 18H7z"/>',
  logout: '<path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4"/><path d="M15 16l4-4-4-4"/><path d="M19 12H9"/>'
});
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const EMO = { '\u{1F44B}': 'terminal', '\u{1F3F7}': 'tag', '\u{1F500}': 'branch', '\u{1F501}': 'repeat', '\u{1F9E9}': 'braces', '\u{1F9FA}': 'layers', '\u{1F3D7}': 'cube', '\u{1F680}': 'rocket', '\u{1F9F1}': 'rows', '\u{1F3AF}': 'pointer', '\u{1F4E6}': 'package', '\u{1F9F0}': 'wrench' };

export { ICON, IC, ic, LOGO, EMO };
