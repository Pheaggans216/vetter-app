import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { motion, AnimatePresence } from "framer-motion";
import { Map, List, Search, ChevronDown, Shield, X, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import VetterDetailPanel from "@/components/map/VetterDetailPanel";
import VetterListCard from "@/components/map/VetterListCard";
import MapFilters from "@/components/map/MapFilters";
import { getAvailableIconSvg, getBusyIconSvg, getTopRatedIconSvg } from "@/components/map/VetterMapIcons";
import { geocodeLocation, cityFallback, distanceMiles, stableJitter } from "@/lib/geocode";

// ── Leaflet icon fix (no default icon 404) ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: "", shadowUrl: "" });

// Build a Leaflet DivIcon using the exact uploaded logo
function makePinIcon(vetter, selected) {
  const isTopRated = vetter.rating >= 4.8 || vetter.secure_exchange_approved;
  const isBusy = vetter.available === false;
  const size = selected ? 52 : 42;
  const pinH = Math.round(size * 1.35);
  const svgHtml = isTopRated
    ? getTopRatedIconSvg(size)
    : isBusy
    ? getBusyIconSvg(size)
    : getAvailableIconSvg(size);
  return L.divIcon({
    html: `<div style="filter:${selected ? 'drop-shadow(0 0 6px rgba(59,130,246,0.7))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'}">${svgHtml}</div>`,
    className: "",
    iconSize: [size, pinH],
    iconAnchor: [size / 2, pinH],
  });
}

// Fly to location helper component
function FlyTo({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center?.[0], center?.[1]]);
  return null;
}

const MILES_TO_KM = 1.60934;
const DEFAULT_CENTER = [39.5, -98.35];
const DEFAULT_ZOOM = 4;

// Demo vetters shown when no real data exists yet
const DEMO_VETTERS = [
  { id: "d1", display_name: "Marcus T.", available: true, rating: 4.9, total_inspections: 87, total_reviews: 72, avg_response_time: "< 1 hr", specialties: ["mechanic"], service_types: ["standard_verification","specialist_vetting"], secure_exchange_approved: true, certified_specialist: true, city: "Los Angeles", state: "CA", _demo: true },
  { id: "d2", display_name: "Sarah K.", available: true, rating: 4.7, total_inspections: 52, total_reviews: 44, avg_response_time: "< 2 hrs", specialties: ["electronics_technician"], service_types: ["standard_verification"], certified_specialist: false, city: "Austin", state: "TX", _demo: true },
  { id: "d3", display_name: "James R.", available: false, rating: 4.5, total_inspections: 31, total_reviews: 28, avg_response_time: "< 3 hrs", specialties: ["jeweler"], service_types: ["specialist_vetting"], certified_specialist: true, city: "New York", state: "NY", _demo: true },
  { id: "d4", display_name: "Priya M.", available: true, rating: 4.8, total_inspections: 64, total_reviews: 59, avg_response_time: "< 1 hr", specialties: ["luxury_authenticator"], service_types: ["standard_verification","secure_exchange_presence"], secure_exchange_approved: true, city: "Chicago", state: "IL", _demo: true },
  { id: "d5", display_name: "Derek W.", available: true, rating: 4.3, total_inspections: 19, total_reviews: 15, avg_response_time: "Same day", specialties: ["appliance_expert"], service_types: ["standard_verification"], city: "Phoenix", state: "AZ", _demo: true },
];

export default function VetterMap() {
  const [view, setView] = useState("map"); // "map" | "list"
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedVetter, setSelectedVetter] = useState(null);
  const [radius, setRadius] = useState(25);
  const [sort, setSort] = useState("distance");
  const [minRating, setMinRating] = useState("any");
  const [serviceFilter, setServiceFilter] = useState("any");
  const [vetterCoords, setVetterCoords] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [quickFilter, setQuickFilter] = useState("all"); // all | available | top_rated
  const [userLocation, setUserLocation] = useState(null);
  const searchRef = useRef();

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coord = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coord);
      setMapCenter(coord);
      setMapZoom(12);
      setHasSearched(true);
    });
  }, []);

  const { data: rawVetters = [], isLoading } = useQuery({
    queryKey: ["map-vetters"],
    queryFn: () => base44.entities.VetterProfile.filter({ status: "active" }),
  });

  const allVetters = rawVetters.length > 0 ? rawVetters : DEMO_VETTERS;

  // Geocode vetters (city/state) once loaded — cache per vetter id
  useEffect(() => {
    if (!allVetters.length) return;
    allVetters.forEach(async (v) => {
      if (vetterCoords[v.id]) return;
      if (v._demo) {
        const coord = cityFallback(v.city);
        if (coord) {
          const jittered = stableJitter(coord.lat, coord.lng, v.id);
          setVetterCoords(prev => ({ ...prev, [v.id]: jittered }));
        }
        return;
      }
      let coord = cityFallback(v.city);
      if (!coord && (v.city || v.state || v.zip_code)) {
        coord = await geocodeLocation(v.city, v.state, v.zip_code);
      }
      if (coord) {
        const jittered = stableJitter(coord.lat, coord.lng, v.id || v.user_email || v.display_name);
        setVetterCoords(prev => ({ ...prev, [v.id]: jittered }));
      }
    });
  }, [allVetters]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) return;
    setGeocoding(true);
    let coord = cityFallback(searchInput);
    if (!coord) coord = await geocodeLocation(searchInput, "", "");
    setGeocoding(false);
    if (coord) {
      setMapCenter([coord.lat, coord.lng]);
      setMapZoom(11);
      setSearch(searchInput);
      setHasSearched(true);
    }
  }, [searchInput]);

  // Filter & sort vetters
  const filteredVetters = allVetters
    .map(v => {
      const coord = vetterCoords[v.id];
      const dist = coord && hasSearched
        ? distanceMiles(mapCenter[0], mapCenter[1], coord.lat, coord.lng)
        : null;
      return { ...v, _coord: coord, _dist: dist };
    })
    .filter(v => {
      if (!v._coord) return false;
      if (hasSearched && v._dist != null && v._dist > radius) return false;
      if (minRating !== "any" && v.rating < parseFloat(minRating)) return false;
      if (serviceFilter !== "any" && !v.service_types?.includes(serviceFilter)) return false;
      if (quickFilter === "available" && v.available === false) return false;
      if (quickFilter === "top_rated" && !(v.rating >= 4.8 || v.secure_exchange_approved)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "distance") return (a._dist ?? 9999) - (b._dist ?? 9999);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "price") {
        const pA = Math.min(...(a.service_types || []).map(s => ({ standard_verification: 39, specialist_vetting: 89, secure_exchange_presence: 149 }[s] || 39)));
        const pB = Math.min(...(b.service_types || []).map(s => ({ standard_verification: 39, specialist_vetting: 89, secure_exchange_presence: 149 }[s] || 39)));
        return pA - pB;
      }
      return 0;
    });

  const handleSelectVetter = (vetter) => {
    setSelectedVetter(prev => prev?.id === vetter.id ? null : vetter);
  };

  const handleViewOnMap = (vetter) => {
    const c = vetterCoords[vetter.id];
    if (c) { setMapCenter([c.lat, c.lng]); setMapZoom(13); }
    setSelectedVetter(vetter);
    setView("map");
  };

  const selectedCoord = selectedVetter ? vetterCoords[selectedVetter.id] : null;
  const selectedDist = selectedCoord && hasSearched
    ? distanceMiles(mapCenter[0], mapCenter[1], selectedCoord.lat, selectedCoord.lng)
    : null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Top bar ── */}
      <div className="shrink-0 px-4 pt-5 pb-3 bg-background border-b border-border/40 space-y-3 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center shrink-0 hover:bg-muted transition-colors"
            title="Use my location"
          >
            <Locate className="w-4 h-4 text-primary" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Enter city, zip, or item location…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="pl-9 pr-10 h-10 rounded-xl text-[13px] bg-card border-border/60"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={geocoding || !searchInput.trim()}
            className="h-10 rounded-xl px-3 shrink-0 text-[13px]"
          >
            {geocoding ? "…" : "Go"}
          </Button>
        </div>

        {/* Quick filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[{ key: "all", label: "Show All" }, { key: "available", label: "Available Only" }, { key: "top_rated", label: "Top-Rated" }].map(f => (
            <button
              key={f.key}
              onClick={() => setQuickFilter(f.key)}
              className={cn("px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 border transition-all",
                quickFilter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View toggle + filter strip */}
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => setView("map")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                view === "map" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
            >
              <Map className="w-3.5 h-3.5" /> Map
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
            >
              <List className="w-3.5 h-3.5" /> List
              {filteredVetters.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {filteredVetters.length}
                </span>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <MapFilters
              radius={radius} onRadius={setRadius}
              sort={sort} onSort={setSort}
              minRating={minRating} onMinRating={setMinRating}
              serviceType={serviceFilter} onServiceType={setServiceFilter}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* MAP VIEW */}
        <AnimatePresence>
          {view === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full bg-muted/30">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-[13px] text-muted-foreground font-medium">Loading nearby Vetters…</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ width: "100%", height: "100%" }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="© OpenStreetMap © CARTO"
                  />
                  <FlyTo center={mapCenter} zoom={mapZoom} />

                  {/* Search radius circle */}
                  {hasSearched && (
                    <Circle
                      center={mapCenter}
                      radius={radius * MILES_TO_KM * 1000}
                      pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.04, weight: 1.5, dashArray: "6 4" }}
                    />
                  )}

                  {/* User location marker */}
                  {userLocation && (() => {
                    const userIcon = L.divIcon({
                      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
                      className: "", iconSize: [16, 16], iconAnchor: [8, 8],
                    });
                    return <Marker position={userLocation} icon={userIcon} />;
                  })()}

                  {/* Vetter pins */}
                  {filteredVetters.map(v => {
                    if (!v._coord) return null;
                    return (
                      <Marker
                        key={v.id}
                        position={[v._coord.lat, v._coord.lng]}
                        icon={makePinIcon(v, selectedVetter?.id === v.id)}
                        eventHandlers={{ click: () => handleSelectVetter(v) }}
                      />
                    );
                  })}
                </MapContainer>
              )}

              {/* Empty state overlay */}
              {!isLoading && !hasSearched && (
                <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
                  <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border/60 shadow-lg px-5 py-4 mx-5 text-center max-w-xs pointer-events-auto">
                    <Locate className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="font-heading font-semibold text-foreground text-[14px] mb-1">Find Vetters near your item</p>
                    <p className="text-muted-foreground text-[12px] leading-snug">Enter the city or zip code where the item is located to see verified professionals nearby.</p>
                  </div>
                </div>
              )}

              {!isLoading && hasSearched && filteredVetters.length === 0 && (
                <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
                  <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border/60 shadow-lg px-5 py-4 mx-5 text-center max-w-xs">
                    <p className="font-heading font-semibold text-foreground text-[14px] mb-1">No Vetters in this area yet</p>
                    <p className="text-muted-foreground text-[12px]">Try expanding the radius or searching a nearby city.</p>
                  </div>
                </div>
              )}

              {/* Vetter count pill */}
              {hasSearched && filteredVetters.length > 0 && !selectedVetter && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[12px] font-semibold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
                  {filteredVetters.length} verified expert{filteredVetters.length !== 1 ? "s" : ""} nearby
                </div>
              )}

              {/* Detail panel (slides up) */}
              {selectedVetter && (
                <VetterDetailPanel
                  vetter={selectedVetter}
                  distanceMi={selectedDist}
                  serviceType={serviceFilter !== "any" ? serviceFilter : null}
                  onSelect={handleSelectVetter}
                  onClose={() => setSelectedVetter(null)}
                  selected={false}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIST VIEW */}
        <AnimatePresence>
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-3 pb-24">
                {/* Search prompt */}
                {!hasSearched && (
                  <div className="py-12 text-center">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-heading font-semibold text-foreground mb-1">Choose a professional near your item</p>
                    <p className="text-muted-foreground text-[13px] max-w-[240px] mx-auto leading-snug">
                      Enter a location above to see nearby trusted Vetters.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-2xl border border-border/60 animate-pulse" />)}
                  </div>
                )}

                {hasSearched && !isLoading && filteredVetters.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="font-heading font-semibold text-foreground mb-1">No Vetters found</p>
                    <p className="text-muted-foreground text-[13px]">Try a larger radius or different location.</p>
                  </div>
                )}

                {filteredVetters.map(v => (
                  <VetterListCard
                    key={v.id}
                    vetter={v}
                    distanceMi={v._dist}
                    onSelect={() => handleSelectVetter(v)}
                    onViewOnMap={() => handleViewOnMap(v)}
                    selected={selectedVetter?.id === v.id}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Legend strip (map only) ── */}
      {view === "map" && (
        <div className="shrink-0 px-4 py-2 bg-background/95 border-t border-border/40 flex items-center gap-4 overflow-x-auto scrollbar-none z-10">
          <LegendItem color="#22c55e" label="Available" />
          <LegendItem color="#f97316" label="Busy" />
          <LegendItem color="#3b82f6" label="Top-Rated" />
          {rawVetters.length === 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0 italic">Demo data</span>
          )}
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="w-3 h-3 rounded-full border-2" style={{ background: color + "22", borderColor: color }} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}