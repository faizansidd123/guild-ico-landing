import guildLogo from "@/assets/guild_Main_Logo_trans.png";
import { appText } from "@/content/app-text";
import { footerCopy } from "@/content/landing-content";
import { siteConfig } from "@/config/site";

const GuildFooter = () => {
  return (
    <footer className="relative pt-16 pb-8">
      {/* Glowing divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,180,200,0.4), rgba(0,200,130,0.4), transparent)" }} />

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-10">
          <div>
            <img src={guildLogo} alt={appText.common.brandName} className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs">
              {footerCopy.brandStatement}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">{appText.footer.socialHeading}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={siteConfig.socials.x} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.x}</a>
              <a href={siteConfig.socials.discord} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.discord}</a>
              <a href={siteConfig.socials.telegram} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.telegram}</a>
              <a href={siteConfig.socials.medium} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.medium}</a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">{appText.footer.disclaimerHeading}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {appText.footer.disclaimerBody}
            </p>
            <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
              <a href={siteConfig.legal.terms} className="hover:text-primary transition-colors">{appText.footer.legalLinks.terms}</a>
              <a href={siteConfig.legal.privacy} className="hover:text-primary transition-colors">{appText.footer.legalLinks.privacy}</a>
              <a href={siteConfig.legal.risk} className="hover:text-primary transition-colors">{appText.footer.legalLinks.risk}</a>
              <a href={siteConfig.legal.cookies} className="hover:text-primary transition-colors">{appText.footer.legalLinks.cookies}</a>
            </div>
          </div>
        </div>

        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          © {siteConfig.year} {siteConfig.companyName}. {appText.footer.rightsReservedSuffix}
        </p>
      </div>
    </footer>
  );
};

export default GuildFooter;
