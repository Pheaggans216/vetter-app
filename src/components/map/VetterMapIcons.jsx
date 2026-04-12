/**
 * Vetter Map Icons — Uses the exact uploaded Vetter logo asset.
 * No redrawing. Logo is embedded as an <image> inside an SVG pin.
 */

const LOGO_URL =
  "https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/efeafb0c3_Vetter_logo_with_ram_s_head_symbol.png";

function makePinSvg({ size = 44, badgeColor = null, badgeIcon = null }) {
  const w = size;
  const pinH = Math.round(size * 1.35);
  const logoSize = Math.round(size * 0.78);
  const logoOffset = Math.round((size - logoSize) / 2);
  const badgeR = Math.round(size * 0.16);
  const badgeX = Math.round(size * 0.78);
  const badgeY = Math.round(size * 0.18);

  const badge = badgeColor
    ? `<circle cx="${badgeX}" cy="${badgeY}" r="${badgeR + 2}" fill="white"/>
       <circle cx="${badgeX}" cy="${badgeY}" r="${badgeR}" fill="${badgeColor}"/>
       ${badgeIcon ? `<text x="${badgeX}" y="${badgeY + Math.round(badgeR * 0.45)}" text-anchor="middle" font-size="${Math.round(badgeR * 1.1)}" fill="white">${badgeIcon}</text>` : ""}`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${pinH}" width="${w}" height="${pinH}">
    <defs>
      <clipPath id="circle-clip-${size}-${badgeColor || 'none'}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"/>
      </clipPath>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <image
      href="${LOGO_URL}"
      x="${logoOffset}"
      y="${logoOffset}"
      width="${logoSize}"
      height="${logoSize}"
      clip-path="url(#circle-clip-${size}-${badgeColor || 'none'})"
      preserveAspectRatio="xMidYMid meet"
    />
    <polygon points="${size / 2 - 5},${size - 2} ${size / 2 + 5},${size - 2} ${size / 2},${pinH - 2}" fill="white" stroke="#e2e8f0" stroke-width="1"/>
    ${badge}
  </svg>`;
}

export function getAvailableIconSvg(size = 44) {
  return makePinSvg({ size, badgeColor: "#22c55e" });
}

export function getBusyIconSvg(size = 44) {
  return makePinSvg({ size, badgeColor: "#f59e0b", badgeIcon: "⏸" });
}

export function getTopRatedIconSvg(size = 44) {
  return makePinSvg({ size, badgeColor: "#3b82f6", badgeIcon: "★" });
}

export function VetterAvailableIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getAvailableIconSvg(size) }} />;
}
export function VetterBusyIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getBusyIconSvg(size) }} />;
}
export function VetterTopRatedIcon({ size = 40 }) {
  return <div dangerouslySetInnerHTML={{ __html: getTopRatedIconSvg(size) }} />;
}