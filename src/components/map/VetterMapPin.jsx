import { getAvailableIconSvg, getBusyIconSvg, getTopRatedIconSvg } from "./VetterMapIcons";

function getIconSvg(vetter) {
  if (vetter.rating >= 4.8 || vetter.secure_exchange_approved) return getTopRatedIconSvg(46);
  if (!vetter.available) return getBusyIconSvg(46);
  return getAvailableIconSvg(46);
}

export default function VetterMapPin({ vetter, onClick, selected }) {

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer select-none"
      style={{ transform: selected ? "scale(1.25)" : "scale(1)", transition: "transform 0.15s ease", zIndex: selected ? 50 : 10, filter: selected ? "drop-shadow(0 0 6px rgba(59,130,246,0.6))" : "none" }}
      dangerouslySetInnerHTML={{ __html: getIconSvg(vetter) }}
    />
  );
}