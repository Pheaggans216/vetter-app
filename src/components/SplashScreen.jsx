import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL =
  "https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/efeafb0c3_Vetter_logo_with_ram_s_head_symbol.png";

// Phases: "splash" → "fly" → "done"
export default function SplashScreen({ onDone, navLogoRef }) {
  const [phase, setPhase] = useState("splash"); // splash | fly | done

  useEffect(() => {
    // After 2.5s of splash, start the fly animation
    const t1 = setTimeout(() => setPhase("fly"), 2500);
    // Hard safety fallback: always finish by 4s so UI is never blocked
    const t2 = setTimeout(() => { setPhase("done"); onDone(); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Once fly animation is done, remove overlay and notify parent
  const handleFlyComplete = () => {
    setPhase("done");
    onDone();
  };

  // Get destination position of navbar logo
  const getNavLogoRect = () => {
    if (navLogoRef?.current) {
      return navLogoRef.current.getBoundingClientRect();
    }
    // Fallback: top-left nav area
    return { left: 20, top: 8, width: 44, height: 44 };
  };

  const isSplash = phase === "splash";
  const isFly = phase === "fly";
  const isDone = phase === "done";

  if (isDone) return null;

  const navRect = getNavLogoRect();

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="splash-overlay"
          className="fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: isFly
              ? "transparent"
              : "linear-gradient(160deg, #0d1b2a 0%, #112240 60%, #0a1628 100%)",
            pointerEvents: isFly ? "none" : isDone ? "none" : "all",
            transition: "background 0.5s ease",
          }}
        >
          {/* Centered splash logo */}
          {isSplash && (
            <motion.div
              key="centered-logo"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.img
                src={LOGO_URL}
                alt="Vetter"
                style={{
                  width: "min(45vw, 45vh)",
                  height: "auto",
                  filter:
                    "brightness(0) invert(1) drop-shadow(0 0 32px rgba(100,160,255,0.5))",
                  animation: "vetter-spin 3s linear infinite",
                }}
              />
            </motion.div>
          )}

          {/* Flying logo — starts centered, flies to navbar */}
          {isFly && (() => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const splashSize = Math.min(vw * 0.52, vh * 0.52);
            const startX = vw / 2 - splashSize / 2;
            const startY = vh / 2 - splashSize / 2;

            return (
              <motion.img
                key="flying-logo"
                src={LOGO_URL}
                alt="Vetter"
                initial={{
                  x: startX,
                  y: startY,
                  width: splashSize,
                  opacity: 1,
                  filter: "brightness(0) invert(1) drop-shadow(0 0 28px rgba(100,160,255,0.4))",
                }}
                animate={{
                  x: navRect.left,
                  y: navRect.top,
                  width: navRect.height * 2.4,
                  opacity: 0,
                  filter: "brightness(0) invert(1) drop-shadow(0 0 0px rgba(100,160,255,0))",
                }}
                transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={handleFlyComplete}
                style={{ position: "fixed", top: 0, left: 0 }}
              />
            );
          })()}
        </motion.div>
      )}

      <style>{`
        @keyframes vetter-spin {
          0%   { filter: brightness(0) invert(1) drop-shadow(0 0 20px rgba(100,160,255,0.4)); transform: rotate(0deg); }
          50%  { filter: brightness(0) invert(1) drop-shadow(0 0 44px rgba(100,190,255,0.7)); transform: rotate(180deg); }
          100% { filter: brightness(0) invert(1) drop-shadow(0 0 20px rgba(100,160,255,0.4)); transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}