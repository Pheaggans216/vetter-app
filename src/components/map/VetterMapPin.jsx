import { cn } from "@/lib/utils";

// Tier: standard=blue, certified=green, premium=gold
function tierColor(vetter) {
  if (vetter.secure_exchange_approved) return { ring: "#D97706", bg: "#FEF3C7", dot: "#F59E0B" }; // gold
  if (vetter.certified_specialist) return { ring: "#16A34A", bg: "#DCFCE7", dot: "#22C55E" }; // green
  return { ring: "#3B82F6", bg: "#EFF6FF", dot: "#60A5FA" }; // blue
}

// Availability dot
function availabilityColor(vetter) {
  if (!vetter.available) return "#9CA3AF"; // gray
  return "#22C55E"; // green
}

export default function VetterMapPin({ vetter, onClick, selected }) {
  const tier = tierColor(vetter);
  const avail = availabilityColor(vetter);
  const initial = vetter.display_name?.[0]?.toUpperCase() || "V";

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer select-none"
      style={{ transform: selected ? "scale(1.18)" : "scale(1)", transition: "transform 0.15s ease", zIndex: selected ? 50 : 10 }}
    >
      {/* Pin circle */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: tier.bg,
          border: `2.5px solid ${tier.ring}`,
          boxShadow: selected
            ? `0 0 0 4px ${tier.ring}33, 0 4px 12px rgba(0,0,0,0.18)`
            : "0 2px 8px rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {vetter.avatar_url ? (
          <img src={vetter.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        ) : (
          <span style={{ fontWeight: 700, fontSize: 15, color: tier.ring }}>{initial}</span>
        )}
      </div>

      {/* Availability dot */}
      <div
        style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: avail,
          border: "1.5px solid white",
        }}
      />

      {/* Pin tail */}
      <div style={{
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `7px solid ${tier.ring}`,
        margin: "0 auto",
        marginTop: -1,
      }} />
    </div>
  );
}