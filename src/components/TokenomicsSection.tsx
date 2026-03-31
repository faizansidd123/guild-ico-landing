import { motion } from "framer-motion";

import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { saleConfig } from "@/config/sale";
import { usdFormatter } from "@/lib/formatters";

const TokenomicsSection = () => {
  const preIcoAllocationUsd = Math.max(0, saleConfig.preIcoAllocationUsd);
  const publicSupplyUsd = Math.max(1, saleConfig.publicSupplyUsd);
  const remainingPublicSupplyUsd = Math.max(0, publicSupplyUsd - preIcoAllocationUsd);
  const preIcoShare = Math.min(100, (preIcoAllocationUsd / publicSupplyUsd) * 100);
  const publicShare = Math.max(0, 100 - preIcoShare);

  const tokenomicsCards = [
    {
      label: appText.tokenomics.cards.preIcoAllocation,
      amount: preIcoAllocationUsd,
      pct: preIcoShare,
      details: `${appText.tokenomics.cards.preIcoDetailsPrefix} ${saleConfig.preIcoMaxDiscountPct}${appText.tokenomics.cards.preIcoDetailsSuffix}`,
    },
    {
      label: appText.tokenomics.cards.remainingPublicPool,
      amount: remainingPublicSupplyUsd,
      pct: publicShare,
      details: appText.tokenomics.cards.remainingPublicPoolDetails,
    },
    {
      label: appText.tokenomics.cards.totalPublicSupply,
      amount: publicSupplyUsd,
      pct: 100,
      details: appText.tokenomics.cards.totalPublicSupplyDetails,
    },
  ];

  return (
    <SectionBlock id="tokenomics">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <SectionHeading
            eyebrow={appText.tokenomics.heading.eyebrow}
            title={appText.tokenomics.heading.title}
            description={
              <>
                {appText.tokenomics.heading.descriptionPrefix} {usdFormatter.format(publicSupplyUsd)},{" "}
                {appText.tokenomics.heading.descriptionMiddle} {usdFormatter.format(preIcoAllocationUsd)}{" "}
                {appText.tokenomics.heading.descriptionSuffix}
              </>
            }
          />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokenomicsCards.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-surface rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <h3 className="font-semibold">{item.label}</h3>
                <span className="font-mono text-primary font-bold whitespace-nowrap">{item.pct.toFixed(1)}%</span>
              </div>
              <p className="font-mono text-sm text-accent mb-3">{usdFormatter.format(item.amount)}</p>
              <div className="h-2 rounded-full bg-surface mb-3 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${item.pct}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{item.details}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TokenomicsSection;
