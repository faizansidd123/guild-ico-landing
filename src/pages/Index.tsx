import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import HeroLeft from "@/components/HeroLeft";
import HeroCenter from "@/components/HeroCenter";
import ICOTerminal from "@/components/ICOTerminal";
import PlatformStory from "@/components/PlatformStory";
import PlatformFeatures from "@/components/PlatformFeatures";
import TokenUtility from "@/components/TokenUtility";
import TransactionsSection from "@/components/TransactionsSection";
import CommunitySection from "@/components/CommunitySection";
import TrustSection from "@/components/TrustSection";
import TokenomicsSection from "@/components/TokenomicsSection";
import RoadmapSection from "@/components/RoadmapSection";
import FAQSection from "@/components/FAQSection";
import WaitlistSection from "@/components/WaitlistSection";
import GuildFooter from "@/components/GuildFooter";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-12 lg:pt-24 lg:pb-16">
        <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-8 lg:gap-6 items-start">
          <HeroLeft />
          <HeroCenter />
          <ICOTerminal />
        </div>
      </section>

      <div className="relative z-10">
        <PlatformStory />
        <PlatformFeatures />
        <TokenUtility />
        <TransactionsSection />
        <TrustSection />
        <TokenomicsSection />
        <RoadmapSection />
        <CommunitySection />
        <WaitlistSection />
        <FAQSection />
        <GuildFooter />
      </div>
    </div>
  );
};

export default Index;
