import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { siteConfig } from "@/config/site";

vi.mock("@/hooks/use-ico-details", () => ({
  useIcoDetails: () => ({
    data: {
      tokenName: "Guild Token",
      tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    },
    error: null,
  }),
}));

import CommunitySection from "@/components/CommunitySection";
import GuildFooter from "@/components/GuildFooter";
import TrustSection from "@/components/TrustSection";

describe("trust and community sections", () => {
  it("renders Guild Network as the community redirect link", () => {
    const { container } = render(<CommunitySection />);

    expect(container.querySelector("#community")).not.toBeNull();
    expect(screen.getByRole("link", { name: /guild network/i })).toHaveAttribute(
      "href",
      siteConfig.community.redirectUrl,
    );
  });

  it("shows only sale and guild token addresses in the trust section", () => {
    render(<TrustSection />);

    expect(screen.queryByText("Verification Links")).not.toBeInTheDocument();
    expect(screen.queryByText("Treasury")).not.toBeInTheDocument();
    expect(screen.getByText("Token Sale Contract")).toBeInTheDocument();
    expect(screen.getByText("Guild Token Contract")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /copy/i })).toHaveLength(2);
  });

  it("keeps only social links plus terms and privacy in the footer", () => {
    render(<GuildFooter />);

    expect(screen.getByRole("link", { name: /^x$/i })).toHaveAttribute("href", siteConfig.socials.x);
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute("href", siteConfig.socials.instagram);
    expect(screen.getByRole("link", { name: /tiktok/i })).toHaveAttribute("href", siteConfig.socials.tiktok);
    expect(screen.getByRole("link", { name: /discord/i })).toBeInTheDocument();
    expect(screen.queryByText(/telegram/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/medium/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", siteConfig.legal.terms);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", siteConfig.legal.privacy);
    expect(screen.queryByText(/risk disclosure/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument();
  });
});
