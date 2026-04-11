/**
 * Vetter Map Icons — Simple flat ram head pin markers
 * Minimal silhouette, high contrast, no gradients, Uber-style
 */

// Simple ram silhouette: round head + two curved horns
function ramSilhouette(fill) {
  return `
    <path d="M11 18 C7 18 4 15 5 11 C6 8 9 7 11 9 C12 7 14 6 16 6 C22 6 26 10 26 15 C26 20 22 24 16 24 C14 24 12 23 11 22 Z" fill="${fill}"/>
    <path d="M11 9 C10 7 8 5 6 6 C4 7 3 10 5 12 C6 13 8 13 10 12 Z" fill="${fill}"/>
    <path d="M21 9 C22 7 24 5 26 6 C28 7 29 10 27 12 C26 13 24 13 22 12 Z" fill="${fill}"/>
  `;
}

export function getAvailableIconSvg(size = 40) {
  const w = size;
  const h = Math.round(size * 1.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${w}" height="${h}">
    <path d="M16 2 C8 2 2 8 2 16 C2 24 16 40 16 40 C16 40 30 24 30 16 C30 8 24 2 16 2 Z" fill="#22c55e"/>
    <g transform="translate(0, 2)">${ramSilhouette('#fff')}</g>
  </svg>`;
}

export function getBusyIconSvg(size = 40) {
  const w = size;
  const h = Math.round(size * 1.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${w}" height="${h}">
    <path d="M16 2 C8 2 2 8 2 16 C2 24 16 40 16 40 C16 40 30 24 30 16 C30 8 24 2 16 2 Z" fill="#f59e0b"/>
    <g transform="translate(0, 2)">${ramSilhouette('#fff')}</g>
  </svg>`;
}

export function getTopRatedIconSvg(size = 40) {
  const w = size;
  const h = Math.round(size * 1.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${w}" height="${h}">
    <path d="M16 2 C8 2 2 8 2 16 C2 24 16 40 16 40 C16 40 30 24 30 16 C30 8 24 2 16 2 Z" fill="#3b82f6"/>
    <g transform="translate(0, 2)">${ramSilhouette('#fff')}</g>
  </svg>`;
}

// React wrappers (for use outside Leaflet)
export function VetterAvailableIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getAvailableIconSvg(size) }} />;
}
export function VetterBusyIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getBusyIconSvg(size) }} />;
}
export function VetterTopRatedIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getTopRatedIconSvg(size) }} />;
}