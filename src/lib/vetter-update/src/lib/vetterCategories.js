// Shared item categories and category-specific inspection steps for Vetter.
// Category values must match the "category" enum in base44/entities/Listing.jsonc.

export const CATEGORY_GROUPS = [
  {
    group: "Vehicles",
    items: [
      { value: "cars_and_motorcycles", label: "Cars & Motorcycles" },
      { value: "trailers_and_rvs", label: "Trailers & RVs" },
      { value: "boats_and_watercraft", label: "Boats & Jet Skis" },
    ],
  },
  {
    group: "Business & Industrial",
    items: [
      { value: "heavy_equipment", label: "Heavy Equipment" },
      { value: "medical_equipment", label: "Medical Equipment" },
      { value: "restaurant_equipment", label: "Restaurant Equipment" },
      { value: "industrial_equipment", label: "Test, CNC & Industrial Equipment" },
      { value: "tools_and_equipment", label: "Tools & Equipment" },
    ],
  },
  {
    group: "Electronics & Valuables",
    items: [
      { value: "electronics", label: "Electronics & Phones" },
      { value: "jewelry_and_watches", label: "Jewelry & Watches" },
      { value: "luxury_fashion_and_handbags", label: "Luxury Fashion & Handbags" },
      { value: "collectibles", label: "Collectibles" },
      { value: "musical_instruments", label: "Musical Instruments" },
    ],
  },
  {
    group: "Home & Outdoor",
    items: [
      { value: "appliances", label: "Appliances" },
      { value: "furniture", label: "Furniture" },
      { value: "home_improvement", label: "Home Improvement Supplies" },
      { value: "garden_and_outdoor", label: "Garden & Outdoor" },
      { value: "sporting_goods", label: "Sporting Goods" },
    ],
  },
  {
    group: "Other",
    items: [
      { value: "event_tickets", label: "Event & Concert Tickets" },
      { value: "rental_or_property_verification", label: "Rental / Property Verification" },
      { value: "other", label: "Other" },
    ],
  },
];

export const CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items);

export const categoryLabel = (value) =>
  CATEGORIES.find(c => c.value === value)?.label || "Other";

// Free or low-cost stolen / ID checks a Vetter can run on site.
export const ID_CHECKS = {
  vin: { label: "VIN", help: "Run the VIN at NICB VINCheck (free) for theft and salvage records.", url: "https://www.nicb.org/vincheck" },
  hin: { label: "Hull ID (HIN)", help: "Match the HIN on the hull to the title and registration." },
  serial: { label: "Serial / IMEI", help: "Check the serial or IMEI with CheckMEND or the maker's lookup.", url: "https://www.checkmend.com" },
  ticket: { label: "Order / ticket ID", help: "Confirm the transfer inside the official ticketing app." },
  none: null,
};

// Extra checklist steps by category, added on top of the tier checklist.
export const CATEGORY_CHECKLIST = {
  cars_and_motorcycles: {
    idCheck: "vin",
    steps: [
      "VIN on dash/door matches the title",
      "Title in seller's name, no lien shown",
      "Cold start, idle and test drive done",
      "Warning lights and OBD scan checked",
      "Tires, brakes, fluids and leaks checked",
    ],
  },
  trailers_and_rvs: {
    idCheck: "vin",
    steps: [
      "VIN plate matches the title",
      "Roof, seals and floor checked for water damage",
      "Lights, brakes and hitch tested",
      "Appliances, generator and plumbing tested (RVs)",
    ],
  },
  boats_and_watercraft: {
    idCheck: "hin",
    steps: [
      "HIN matches title / registration",
      "Hull checked for cracks, blisters and repairs",
      "Engine hours recorded",
      "Engine started and run (on trailer or water)",
      "Trailer title and condition checked",
    ],
  },
  heavy_equipment: {
    idCheck: "serial",
    steps: [
      "Serial plate matches paperwork",
      "Hour meter recorded",
      "Started and run under load",
      "Hydraulics checked for leaks and drift",
      "Undercarriage / tires and buckets checked",
    ],
  },
  medical_equipment: {
    idCheck: "serial",
    steps: [
      "Model and serial match the listing",
      "Powers on and passes self-test",
      "Service / calibration records reviewed",
      "Accessories and probes included as listed",
    ],
  },
  restaurant_equipment: {
    idCheck: "serial",
    steps: [
      "Data plate (model, serial, voltage, gas type) recorded",
      "Powered on and reached temperature",
      "Seals, compressor and burners checked",
      "No rust or damage on food-contact surfaces",
    ],
  },
  industrial_equipment: {
    idCheck: "serial",
    steps: [
      "Model and serial match the listing",
      "Powered on, controls and readouts work",
      "Calibration date / certificate checked",
      "Spindle, axes or moving parts run smoothly (CNC)",
      "Safety guards and e-stop work",
    ],
  },
  tools_and_equipment: {
    idCheck: "serial",
    steps: ["Serial recorded", "Runs under load", "Batteries / chargers included and working"],
  },
  electronics: {
    idCheck: "serial",
    steps: [
      "Serial / IMEI matches the device settings",
      "Not locked to an account (iCloud / Google / carrier)",
      "Screen, buttons, cameras, ports and charging tested",
      "Battery health recorded",
    ],
  },
  jewelry_and_watches: {
    idCheck: "serial",
    steps: [
      "Hallmarks / stamps photographed",
      "Weight recorded",
      "Stones checked (tester or loupe)",
      "Watch serial and movement checked; papers and box noted",
    ],
  },
  luxury_fashion_and_handbags: {
    idCheck: "none",
    steps: ["Date code / serial photographed", "Stitching, hardware and logos checked", "Receipt, dust bag and box noted"],
  },
  collectibles: {
    idCheck: "none",
    steps: ["Grading / certificate number verified", "Close-up photos of condition", "Signs of reproduction checked"],
  },
  musical_instruments: {
    idCheck: "serial",
    steps: ["Serial matches maker's records", "Played / powered on and tested", "Neck, frets, keys or valves checked"],
  },
  appliances: {
    idCheck: "serial",
    steps: ["Model and serial recorded", "Powered on and run through a cycle", "Leaks, noise and damage checked"],
  },
  event_tickets: {
    idCheck: "ticket",
    steps: [
      "Seller showed tickets in the official app (not a screenshot)",
      "Event, date, section and seats match the listing",
      "Transfer completed through the official app",
    ],
  },
  rental_or_property_verification: {
    idCheck: "none",
    steps: [
      "Property exists at the listed address",
      "Person showing it has keys / access",
      "Owner or manager confirmed through public records or the management office",
      "Unit matches listing photos",
    ],
  },
};

export const getCategoryChecklist = (category) =>
  CATEGORY_CHECKLIST[category] || { idCheck: "serial", steps: [] };
