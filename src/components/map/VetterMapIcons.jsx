/**
 * Vetter Map Icons — Reusable SVG ram head markers
 * Use as React components or call getSvgString() for Leaflet DivIcon HTML
 */

// ── SVG paths ──────────────────────────────────────────────────────────────
const RAM_PATH = `
  M32 10
  C22 10 15 16 13 23
  C10 18 5 20 5 26
  C5 31 9 34 13 33
  C14 37 17 40 20 42
  L22 48 L26 44 L28 48 L32 52
  L36 48 L38 44 L42 48
  L44 42 C47 40 50 37 51 33
  C55 34 59 31 59 26
  C59 20 54 18 51 23
  C49 16 42 10 32 10 Z
`;

// ── Individual icon SVG strings (for Leaflet DivIcon) ─────────────────────

export function getAvailableIconSvg(size = 44) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" width="${size}" height="${size + 8}">
      <defs>
        <radialGradient id="g_av" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#6ee34b"/>
          <stop offset="100%" stop-color="#22a10a"/>
        </radialGradient>
        <filter id="sh_av" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
        </filter>
      </defs>
      <!-- Pin body -->
      <ellipse cx="32" cy="31" rx="26" ry="26" fill="white" filter="url(#sh_av)"/>
      <!-- Ram head -->
      <g transform="translate(4,6)" filter="url(#sh_av)">
        <!-- left horn -->
        <path d="M28 12 C18 10 10 15 10 24 C10 28 12 31 15 32 C12 32 9 30 9 26 C9 19 15 13 22 12 Z" fill="url(#g_av)"/>
        <!-- right horn -->
        <path d="M36 12 C46 10 54 15 54 24 C54 28 52 31 49 32 C52 32 55 30 55 26 C55 19 49 13 42 12 Z" fill="url(#g_av)"/>
        <!-- main skull -->
        <path d="M32 8 C21 8 14 15 14 24 C14 30 17 35 22 38 L24 44 L28 40 L32 46 L36 40 L40 44 L42 38 C47 35 50 30 50 24 C50 15 43 8 32 8 Z" fill="url(#g_av)"/>
        <!-- face detail -->
        <path d="M26 26 C26 28 28 30 32 30 C36 30 38 28 38 26 C38 24 36 23 32 23 C28 23 26 24 26 26 Z" fill="#1a8a00" opacity="0.5"/>
        <!-- eyes -->
        <circle cx="25" cy="23" r="2" fill="white" opacity="0.8"/>
        <circle cx="39" cy="23" r="2" fill="white" opacity="0.8"/>
      </g>
      <!-- Pin tail -->
      <polygon points="32,62 26,54 38,54" fill="#22a10a"/>
    </svg>
  `;
}

export function getBusyIconSvg(size = 44) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" width="${size}" height="${size + 8}">
      <defs>
        <radialGradient id="g_bu" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ffd94b"/>
          <stop offset="100%" stop-color="#e08a00"/>
        </radialGradient>
        <filter id="sh_bu" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
        </filter>
      </defs>
      <ellipse cx="32" cy="31" rx="26" ry="26" fill="white" filter="url(#sh_bu)"/>
      <g transform="translate(4,6)" filter="url(#sh_bu)">
        <path d="M28 12 C18 10 10 15 10 24 C10 28 12 31 15 32 C12 32 9 30 9 26 C9 19 15 13 22 12 Z" fill="url(#g_bu)"/>
        <path d="M36 12 C46 10 54 15 54 24 C54 28 52 31 49 32 C52 32 55 30 55 26 C55 19 49 13 42 12 Z" fill="url(#g_bu)"/>
        <path d="M32 8 C21 8 14 15 14 24 C14 30 17 35 22 38 L24 44 L28 40 L32 46 L36 40 L40 44 L42 38 C47 35 50 30 50 24 C50 15 43 8 32 8 Z" fill="url(#g_bu)"/>
        <path d="M26 26 C26 28 28 30 32 30 C36 30 38 28 38 26 C38 24 36 23 32 23 C28 23 26 24 26 26 Z" fill="#b86000" opacity="0.45"/>
        <circle cx="25" cy="23" r="2" fill="white" opacity="0.8"/>
        <circle cx="39" cy="23" r="2" fill="white" opacity="0.8"/>
      </g>
      <!-- Clock badge -->
      <circle cx="50" cy="46" r="10" fill="white" stroke="#e08a00" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="8" fill="#fff8e1"/>
      <line x1="50" y1="40" x2="50" y2="46" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="50" y1="46" x2="55" y2="49" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Pin tail -->
      <polygon points="32,62 26,54 38,54" fill="#e08a00"/>
    </svg>
  `;
}

export function getTopRatedIconSvg(size = 44) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" width="${size}" height="${size + 8}">
      <defs>
        <radialGradient id="g_tr" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#5bc8f5"/>
          <stop offset="100%" stop-color="#1a7abf"/>
        </radialGradient>
        <filter id="sh_tr" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
        </filter>
      </defs>
      <ellipse cx="32" cy="31" rx="26" ry="26" fill="white" filter="url(#sh_tr)"/>
      <g transform="translate(4,6)" filter="url(#sh_tr)">
        <path d="M28 12 C18 10 10 15 10 24 C10 28 12 31 15 32 C12 32 9 30 9 26 C9 19 15 13 22 12 Z" fill="url(#g_tr)"/>
        <path d="M36 12 C46 10 54 15 54 24 C54 28 52 31 49 32 C52 32 55 30 55 26 C55 19 49 13 42 12 Z" fill="url(#g_tr)"/>
        <path d="M32 8 C21 8 14 15 14 24 C14 30 17 35 22 38 L24 44 L28 40 L32 46 L36 40 L40 44 L42 38 C47 35 50 30 50 24 C50 15 43 8 32 8 Z" fill="url(#g_tr)"/>
        <path d="M26 26 C26 28 28 30 32 30 C36 30 38 28 38 26 C38 24 36 23 32 23 C28 23 26 24 26 26 Z" fill="#0d5a9e" opacity="0.45"/>
        <circle cx="25" cy="23" r="2" fill="white" opacity="0.8"/>
        <circle cx="39" cy="23" r="2" fill="white" opacity="0.8"/>
      </g>
      <!-- Star badge -->
      <polygon points="50,37 51.8,42.5 57.5,42.5 53,45.8 54.8,51.5 50,48 45.2,51.5 47,45.8 42.5,42.5 48.2,42.5"
        fill="#f5c518" stroke="#d4a017" stroke-width="0.5"/>
      <!-- Pin tail -->
      <polygon points="32,62 26,54 38,54" fill="#1a7abf"/>
    </svg>
  `;
}

// ── React components (for use outside of Leaflet) ─────────────────────────

export function VetterAvailableIcon({ size = 44 }) {
  return <div dangerouslySetInnerHTML={{ __html: getAvailableIconSvg(size) }} />;
}

export function VetterBusyIcon({ size = 44 }) {
  return <div dangerouslySetInnerHTML={{ __html: getBusyIconSvg(size) }} />;
}

export function VetterTopRatedIcon({ size = 44 }) {
  return <div dangerouslySetInnerHTML={{ __html: getTopRatedIconSvg(size) }} />;
}