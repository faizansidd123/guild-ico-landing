import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AnimatedBackground", () => ({ default: () => <div>AnimatedBackground</div> }));
vi.mock("@/components/Navbar", () => ({ default: () => <div>Navbar</div> }));
vi.mock("@/components/HeroLeft", () => ({ default: () => <div>HeroLeft</div> }));
vi.mock("@/components/HeroCenter", () => ({ default: () => <div>HeroCenter</div> }));
vi.mock("@/components/ICOTerminal", () => ({ default: () => <div>ICOTerminal</div> }));
vi.mock("@/components/PlatformStory", () => ({ default: () => <div>PlatformStory</div> }));
vi.mock("@/components/PlatformFeatures", () => ({ default: () => <div>PlatformFeatures</div> }));
vi.mock("@/components/TokenUtility", () => ({ default: () => <div>TokenUtility</div> }));
vi.mock("@/components/TransactionsSection", () => ({ default: () => <div>TransactionsSection</div> }));
vi.mock("@/components/CommunitySection", () => ({ default: () => <div>CommunitySection</div> }));
vi.mock("@/components/TrustSection", () => ({ default: () => <div>TrustSection</div> }));
vi.mock("@/components/TokenomicsSection", () => ({ default: () => <div>TokenomicsSection</div> }));
vi.mock("@/components/RoadmapSection", () => ({ default: () => <div>RoadmapSection</div> }));
vi.mock("@/components/FAQSection", () => ({ default: () => <div>FAQSection</div> }));
vi.mock("@/components/WaitlistSection", () => ({ default: () => <div>WaitlistSection</div> }));
vi.mock("@/components/GuildFooter", () => ({ default: () => <div>GuildFooter</div> }));

import Index from "@/pages/Index";

describe("Index page", () => {
  it("renders the remaining landing sections and omits hidden sections", () => {
    render(<Index />);

    expect(screen.getByText("PlatformStory")).toBeInTheDocument();
    expect(screen.getByText("TransactionsSection")).toBeInTheDocument();
    expect(screen.getByText("CommunitySection")).toBeInTheDocument();
    expect(screen.queryByText("PlatformFeatures")).not.toBeInTheDocument();
    expect(screen.queryByText("TokenomicsSection")).not.toBeInTheDocument();
    expect(screen.queryByText("RoadmapSection")).not.toBeInTheDocument();
    expect(screen.queryByText("WaitlistSection")).not.toBeInTheDocument();
  });
});
