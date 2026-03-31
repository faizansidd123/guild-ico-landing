import { motion } from "framer-motion";
import platformImg from "@/assets/image_platform.webp";
import profileImg from "@/assets/profile_for_fans.webp";
import fansImg from "@/assets/elements_for_fans_1.webp";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { featureHighlights, platformFeatureCards } from "@/content/landing-content";

const featureImages = {
  platform: platformImg,
  profile: profileImg,
  fans: fansImg,
} as const;

const PlatformFeatures = () => {
  return (
    <SectionBlock>
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <SectionHeading
            eyebrow={appText.platformFeatures.heading.eyebrow}
            title={
              <>
                {appText.platformFeatures.heading.titlePrefix}{" "}
                <span className="text-primary">{appText.platformFeatures.heading.titleAccent}</span>
              </>
            }
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
            {featureHighlights.map((item) => (
              <div key={item.title} className="glass-surface rounded-xl p-4">
                <p className="font-mono text-primary text-sm mb-1">{item.icon}</p>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-12 lg:space-y-14">
          {platformFeatureCards.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`flex flex-col ${f.align === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-6 lg:gap-10`}
            >
              <motion.div
                whileHover={{ rotateY: 5, rotateX: -5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="glass-surface rounded-2xl p-3 flex-shrink-0"
                style={{ perspective: "1000px" }}
              >
                <img
                  src={featureImages[f.imageKey]}
                  alt={f.title}
                  className={`w-72 h-64 lg:w-80 lg:h-72 rounded-xl ${f.fit === "contain" ? "object-contain bg-surface p-2" : "object-cover"}`}
                />
              </motion.div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default PlatformFeatures;
