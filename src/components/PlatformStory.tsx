import { motion } from "framer-motion";
import bgImage from "@/assets/Background_whatarenfts.webp";
import { SectionBlock, SectionContainer } from "@/components/layout/section-primitives";
import { storyCopy } from "@/content/landing-content";

const PlatformStory = () => {
  return (
    <SectionBlock id="platform" className="overflow-hidden">
      {/* Diagonal BG */}
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 15%, 100% 0%, 100% 85%, 0% 100%)" }}
      >
        <img src={bgImage} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        {/* Waveform lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 400" fill="none">
          {[0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d={`M0,${150 + i * 40} Q300,${130 + i * 40} 600,${150 + i * 40} T1200,${150 + i * 40}`}
              stroke="rgba(0,245,255,0.3)"
              strokeWidth="1.5"
              fill="none"
              animate={{
                d: [
                  `M0,${150 + i * 40} Q300,${130 + i * 40} 600,${150 + i * 40} T1200,${150 + i * 40}`,
                  `M0,${150 + i * 40} Q300,${170 + i * 40} 600,${150 + i * 40} T1200,${150 + i * 40}`,
                  `M0,${150 + i * 40} Q300,${130 + i * 40} 600,${150 + i * 40} T1200,${150 + i * 40}`,
                ],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </div>

      <SectionContainer className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary font-mono text-xs tracking-widest uppercase mb-3">▸ {storyCopy.eyebrow}</p>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter text-foreground mb-6">
            {storyCopy.titlePrefix} <span className="text-primary text-glow-cyan">{storyCopy.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-lg">
            {storyCopy.description}
          </p>
        </motion.div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default PlatformStory;
