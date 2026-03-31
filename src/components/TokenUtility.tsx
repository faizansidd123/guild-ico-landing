import { motion } from "framer-motion";
import womanIp from "@/assets/woman_ip.webp";
import { SectionBlock, SectionContainer } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { tokenUtilityItems } from "@/content/landing-content";

const TokenUtility = () => {
  return (
    <SectionBlock id="utility">
      <SectionContainer className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary font-mono text-xs tracking-widest uppercase mb-3">▸ {appText.tokenUtility.heading.eyebrow}</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-foreground mb-6">
            <span className="text-accent">{appText.tokenUtility.heading.titlePrefix}</span> {appText.tokenUtility.heading.titleSuffix}
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-lg">
            {appText.tokenUtility.description}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {tokenUtilityItems.map((u, i) => (
              <motion.div
                key={u.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-surface rounded-xl p-4 flex items-center gap-3"
              >
                <span className="text-primary text-lg">{u.icon}</span>
                <span className="text-sm text-foreground">{u.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0,200,130,0.1) 0%, transparent 70%)",
                filter: "blur(50px)",
                transform: "scale(1.5)",
              }}
            />
            <img
              src={womanIp}
              alt={appText.tokenUtility.imageAlt}
              className="w-64 lg:w-80 relative z-10 drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TokenUtility;
