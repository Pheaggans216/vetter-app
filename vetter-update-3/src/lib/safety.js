// Meetup safety helpers shared across Vetter pages.

export const ESCORT_MIN_ITEM_PRICE = 5000;

// Opens Google Maps searching for police "safe exchange zones" near the meetup city.
export const safeZoneMapUrl = (city, state) => {
  const where = [city, state].filter(Boolean).join(" ") || "me";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`police safe exchange zone near ${where}`)}`;
};

export const SAFETY_TIPS = [
  "Meet in daylight at a police safe exchange zone or a busy, well-lit public place.",
  "Never bring cash to a meetup unless the item has been verified. Pay through a traceable method.",
  "Tell someone where you're going and share your live location.",
  "If anything feels wrong, leave. No deal is worth your safety.",
];

export const SECURITY_STATUS_LABEL = {
  requested: "Security escort requested, we'll confirm availability and price",
  confirmed: "Security escort confirmed",
  declined: "Security escort not available for this meetup",
};
