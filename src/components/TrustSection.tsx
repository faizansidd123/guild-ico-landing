import { Copy } from "lucide-react";
import { motion } from "framer-motion";

import { appText } from "@/content/app-text";
import { saleConfig } from "@/config/sale";
import { useIcoDetails } from "@/hooks/use-ico-details";
import { formatAddress } from "@/lib/eth";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TrustSection = () => {
  const { data: icoDetails } = useIcoDetails();
  const guildTokenAddress = (icoDetails?.tokenAddress || saleConfig.walletTokenAddress || "").trim();

  const copyValue = async (label: string, value: string) => {
    if (value.length === 0) {
      toast({
        title: `${label} ${appText.trust.copyToasts.missingSuffix}`,
        description: `${appText.trust.copyToasts.configurePrefix} ${label} ${appText.trust.copyToasts.configureSuffix}`,
      });
      return;
    }

    await navigator.clipboard.writeText(value);
    toast({
      title: `${label} ${appText.trust.copyToasts.copiedSuffix}`,
      description: value,
    });
  };

  return (
    <SectionBlock id="trust">
      <SectionContainer>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <SectionHeading eyebrow={appText.trust.heading.eyebrow} title={appText.trust.heading.title} />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <article className="glass-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{appText.trust.addressesTitle}</h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-surface p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground">{appText.trust.labels.tokenSaleContract}</p>
                  <p className="font-mono">{saleConfig.saleContractAddress ? formatAddress(saleConfig.saleContractAddress, 6) : appText.trust.labels.notConfigured}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyValue(appText.trust.copyLabels.saleContract, saleConfig.saleContractAddress)}>
                  <Copy className="w-4 h-4 mr-2" /> {appText.trust.copyButton}
                </Button>
              </div>

              <div className="rounded-lg bg-surface p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground">{appText.trust.labels.guildTokenContract}</p>
                  <p className="font-mono">{guildTokenAddress ? formatAddress(guildTokenAddress, 6) : appText.trust.labels.notConfigured}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyValue(appText.trust.copyLabels.guildTokenContract, guildTokenAddress)}>
                  <Copy className="w-4 h-4 mr-2" /> {appText.trust.copyButton}
                </Button>
              </div>
            </div>
          </article>
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TrustSection;
