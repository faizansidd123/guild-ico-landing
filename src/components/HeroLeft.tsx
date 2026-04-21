import { motion } from "framer-motion";
import { appText } from "@/content/app-text";
import { heroCopy } from "@/content/landing-content";

const HeroLeft = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col justify-center gap-6 lg:gap-8"
    >
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-primary font-mono text-sm tracking-widest uppercase mb-4"
        >
          ▸ {heroCopy.eyebrow}
        </motion.p>
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-foreground text-glow-white leading-tight">
          {heroCopy.titlePrefix} <span className="text-primary text-glow-cyan">{heroCopy.titleAccent}</span>
        </h1>
      </div>

      <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-md">
        {heroCopy.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.a
          href="#platform"
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,180,200,0.4)" }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm tracking-wide relative overflow-hidden shimmer"
        >
          {appText.heroLeft.explorePlatform}
        </motion.a>
      </div>
    </motion.div>
  );
};

export default HeroLeft;
