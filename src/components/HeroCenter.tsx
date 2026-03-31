import { motion } from "framer-motion";
import manIp from "@/assets/man_ip.webp";
import { appText } from "@/content/app-text";

const WaveformSVG = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0, 1, 2].map((i) => (
      <motion.path
        key={i}
        d={`M0,${180 + i * 30} Q100,${160 + i * 30} 200,${180 + i * 30} T400,${180 + i * 30}`}
        stroke="rgba(0,245,255,0.15)"
        strokeWidth="2"
        fill="none"
        animate={{
          d: [
            `M0,${180 + i * 30} Q100,${160 + i * 30} 200,${180 + i * 30} T400,${180 + i * 30}`,
            `M0,${180 + i * 30} Q100,${200 + i * 30} 200,${180 + i * 30} T400,${180 + i * 30}`,
            `M0,${180 + i * 30} Q100,${160 + i * 30} 200,${180 + i * 30} T400,${180 + i * 30}`,
          ],
        }}
        transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </svg>
);

const HeroCenter = () => {
  return (
    <div className="relative flex items-center justify-center">
      <WaveformSVG />
      {/* Glow aura */}
      <div
        className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,245,255,0.15) 0%, rgba(0,200,130,0.1) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Holographic frame */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <div className="relative glass-surface rounded-2xl p-2 animate-pulse-glow">
          <img
            src={manIp}
            alt={appText.heroCenter.imageAlt}
            className="w-56 h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain drop-shadow-2xl"
          />
        </div>
        {/* Floating holographic panels */}
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [0, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-4 -right-8 glass-surface rounded-lg px-3 py-1.5 text-xs font-mono text-primary"
        >
          {appText.heroCenter.liveBadge}
        </motion.div>
        <motion.div
          animate={{ y: [5, -5, 5], rotate: [0, -2, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-3 -left-6 glass-surface rounded-lg px-3 py-1.5 text-xs font-mono text-accent"
        >
          {appText.heroCenter.tokenBadge}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroCenter;
