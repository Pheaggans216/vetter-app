import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #0d1b2a 0%, #112240 60%, #0a1628 100%)" }}
        >
          <motion.img
            src="https://media.base44.com/images/public/69d2a34ea0832e2ee10bd09e/efeafb0c3_Vetter_logo_with_ram_s_head_symbol.png"
            alt="Vetter"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              width: "min(55vw, 55vh)",
              height: "auto",
              filter: "brightness(0) invert(1) drop-shadow(0 0 32px rgba(100,160,255,0.35))",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />

          <style>{`
            @keyframes pulse-glow {
              0%, 100% { filter: brightness(0) invert(1) drop-shadow(0 0 24px rgba(100,160,255,0.3)); }
              50% { filter: brightness(0) invert(1) drop-shadow(0 0 48px rgba(100,180,255,0.55)); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}