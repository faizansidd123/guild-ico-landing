import { motion } from "framer-motion";

import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { roadmapPhases } from "@/content/landing-content";

const RoadmapSection = () => {
  return (
    <SectionBlock id="roadmap">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <SectionHeading eyebrow={appText.roadmap.heading.eyebrow} title={appText.roadmap.heading.title} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {roadmapPhases.map((phase, index) => (
            <motion.article
              key={phase.quarter}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-surface rounded-xl p-6"
            >
              <p className="font-mono text-xs text-primary mb-2">{phase.quarter}</p>
              <h3 className="text-xl font-semibold mb-3">{phase.title}</h3>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default RoadmapSection;
