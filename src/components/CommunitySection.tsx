import { motion } from "framer-motion";
import communityImg from "@/assets/elements_for_fans.webp";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { communityCopy } from "@/content/landing-content";

const CommunitySection = () => {
  return (
    <SectionBlock id="community-visual" className="overflow-hidden">
      <SectionContainer className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionHeading
            eyebrow={communityCopy.eyebrow}
            title={
              <>
                {communityCopy.titlePrefix} <span className="text-primary text-glow-cyan">{communityCopy.titleAccent}</span>
              </>
            }
            description={communityCopy.description}
            titleClassName="text-3xl lg:text-5xl text-foreground mb-1"
            descriptionClassName="text-lg max-w-xl"
            className="mb-8"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-lg mx-auto"
        >
          {/* Glow particles */}
          <div className="absolute -inset-10 rounded-3xl" style={{ background: "radial-gradient(circle, rgba(0,180,200,0.08) 0%, transparent 60%)", filter: "blur(40px)" }} />
          <div className="absolute top-1/4 -right-10 w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,200,130,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
          <div className="absolute bottom-1/4 -left-10 w-16 h-16 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,140,255,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
          
          <div className="glass-surface rounded-2xl p-3 relative z-10">
            <img
              src={communityImg}
              alt={appText.community.imageAlt}
              className="w-full rounded-xl"
            />
          </div>
        </motion.div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default CommunitySection;
