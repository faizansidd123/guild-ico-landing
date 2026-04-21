import { appText } from "@/content/app-text";
import { siteConfig } from "@/config/site";

const GuildFooter = () => {
  return (
    <footer className="relative pt-16 pb-8">
      {/* Glowing divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,180,200,0.4), rgba(0,200,130,0.4), transparent)" }} />

      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2 mb-10">
          <div>
            <h4 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">{appText.footer.socialHeading}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={siteConfig.socials.x} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.x}</a>
              <a href={siteConfig.socials.instagram} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.instagram}</a>
              <a href={siteConfig.socials.tiktok} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.tiktok}</a>
              <a href={siteConfig.socials.discord} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.socialLinks.discord}</a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">{appText.footer.legalHeading}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={siteConfig.legal.terms} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.legalLinks.terms}</a>
              <a href={siteConfig.legal.privacy} className="hover:text-primary transition-colors" target="_blank" rel="noreferrer">{appText.footer.legalLinks.privacy}</a>
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
