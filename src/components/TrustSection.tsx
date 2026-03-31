import { Copy } from "lucide-react";
import { motion } from "framer-motion";

import { appText } from "@/content/app-text";
import { saleConfig, chainCatalog } from "@/config/sale";
import { siteConfig } from "@/config/site";
import { formatAddress } from "@/lib/eth";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TrustSection = () => {
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

        <div className="grid lg:grid-cols-2 gap-6">
          <article className="glass-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{appText.trust.addressesTitle}</h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-surface p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground">{appText.trust.labels.treasury}</p>
                  <p className="font-mono">{saleConfig.treasuryAddress ? formatAddress(saleConfig.treasuryAddress, 6) : appText.trust.labels.notConfigured}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyValue(appText.trust.copyLabels.treasuryAddress, saleConfig.treasuryAddress)}>
                  <Copy className="w-4 h-4 mr-2" /> {appText.trust.copyButton}
                </Button>
              </div>

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
                  <p className="text-muted-foreground">{appText.trust.labels.usdcContract}</p>
                  <p className="font-mono">{saleConfig.usdcContractAddress ? formatAddress(saleConfig.usdcContractAddress, 6) : appText.trust.labels.notConfigured}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyValue(appText.trust.copyLabels.usdcContract, saleConfig.usdcContractAddress)}>
                  <Copy className="w-4 h-4 mr-2" /> {appText.trust.copyButton}
                </Button>
              </div>
            </div>
          </article>

          <article className="glass-surface rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{appText.trust.verificationTitle}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a className="block hover:text-primary" href={siteConfig.resources.audit} target="_blank" rel="noreferrer">{appText.trust.verificationLinks.auditReport}</a>
              <a className="block hover:text-primary" href={siteConfig.resources.whitepaper} target="_blank" rel="noreferrer">{appText.trust.verificationLinks.whitepaper}</a>
              <a className="block hover:text-primary" href={siteConfig.resources.docs} target="_blank" rel="noreferrer">{appText.trust.verificationLinks.docs}</a>
              <a className="block hover:text-primary" href={`${chainCatalog.ethereum.explorerUrl}/address/${saleConfig.saleContractAddress || ""}`} target="_blank" rel="noreferrer">{appText.trust.verificationLinks.etherscan}</a>
              <a className="block hover:text-primary" href={`${chainCatalog.base.explorerUrl}/address/${saleConfig.saleContractAddress || ""}`} target="_blank" rel="noreferrer">{appText.trust.verificationLinks.basescan}</a>
            </div>
          </article>
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default TrustSection;
