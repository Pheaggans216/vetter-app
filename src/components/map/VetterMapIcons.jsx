/**
 * Vetter Map Icons — Reusable SVG ram head markers
 * Three variants: available (green), busy (orange), top-rated (blue)
 * Use getSvgString() for Leaflet DivIcon HTML, or use React components directly.
 */

// Minimal flat ram head path (centered in a 40x40 viewBox)
// Horns + skull silhouette, clean and readable at small sizes
const ramHeadPath = (fillColor) => `
  <!-- left horn -->
  <path d="M14 12 C9 10 5 14 5 19 C5 23 8 26 12 26 C10 26 8 24 8 21 C8 16 11 13 15 13 Z" fill="${fillColor}"/>
  <!-- right horn -->
  <path d="M26 12 C31 10 35 14 35 19 C35 23 32 26 28 26 C30 26 32 24 32 21 C32 16 29 13 25 13 Z" fill="${fillColor}"/>
  <!-- skull -->
  <ellipse cx="20" cy="22" rx="10" ry="9" fill="${fillColor}"/>
  <!-- snout -->
  <ellipse cx="20" cy="28" rx="6" ry="4" fill="${fillColor}"/>
  <!-- eyes -->
  <circle cx="16.5" cy="20" r="1.4" fill="rgba(255,255,255,0.75)"/>
  <circle cx="23.5" cy="20" r="1.4" fill="rgba(255,255,255,0.75)"/>
  <!-- nostrils -->
  <circle cx="18" cy="28.5" r="1" fill="rgba(0,0,0,0.18)"/>
  <circle cx="22" cy="28.5" r="1" fill="rgba(0,0,0,0.18)"/>
`;

export function getAvailableIconSvg(size = 44) {
  const s = size;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="${s}" height="${Math.round(s * 1.2)}">
      <defs>
        <filter id="sh_av" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#00000028"/>
        </filter>
      </defs>
      <!-- Pin circle -->
      <circle cx="20" cy="20" r="18" fill="#22c55e" filter="url(#sh_av)"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <!-- Ram head -->
      <g transform="translate(0, 2)">
        ${ramHeadPath('#fff')}
      </g>
      <!-- Pin tail -->
      <polygon points="20,44 14,34 26,34" fill="#16a34a"/>
    </svg>
  `;
}

export function getBusyIconSvg(size = 44) {
  const s = size;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="${s}" height="${Math.round(s * 1.2)}">
      <defs>
        <filter id="sh_bu" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#00000028"/>
        </filter>
      </defs>
      <!-- Pin circle -->
      <circle cx="20" cy="20" r="18" fill="#f97316" filter="url(#sh_bu)"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <!-- Ram head (slightly dim) -->
      <g transform="translate(0, 2)" opacity="0.9">
        ${ramHeadPath('#fff')}
      </g>
      <!-- Clock badge -->
      <circle cx="31" cy="32" r="7" fill="white" stroke="#f97316" stroke-width="1.2" filter="url(#sh_bu)"/>
      <circle cx="31" cy="32" r="5.5" fill="#fff7ed"/>
      <line x1="31" y1="28" x2="31" y2="32" stroke="#374151" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="31" y1="32" x2="34.5" y2="34" stroke="#374151" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Pin tail -->
      <polygon points="20,44 14,34 26,34" fill="#ea580c"/>
    </svg>
  `;
}

export function getTopRatedIconSvg(size = 44) {
  const s = size;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="${s}" height="${Math.round(s * 1.2)}">
      <defs>
        <filter id="sh_tr" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#00000028"/>
        </filter>
      </defs>
      <!-- Pin circle -->
      <circle cx="20" cy="20" r="18" fill="#3b82f6" filter="url(#sh_tr)"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <!-- Ram head -->
      <g transform="translate(0, 2)">
        ${ramHeadPath('#fff')}
      </g>
      <!-- Star badge -->
      <circle cx="31" cy="32" r="7" fill="white" stroke="#3b82f6" stroke-width="1.2" filter="url(#sh_tr)"/>
      <polygon points="31,26.5 32.2,30 35.8,30 33,32.2 34,35.8 31,33.5 28,35.8 29,32.2 26.2,30 29.8,30"
        fill="#fbbf24" stroke="#d97706" stroke-width="0.4"/>
      <!-- Pin tail -->
      <polygon points="20,44 14,34 26,34" fill="#2563eb"/>
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