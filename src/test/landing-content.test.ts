import { describe, expect, it } from "vitest";

import {
  communityCopy,
  faqItems,
  featureHighlights,
  footerCopy,
  heroCopy,
  navLinks,
  platformFeatureCards,
  roadmapPhases,
  storyCopy,
  tokenUtilityItems,
} from "@/content/landing-content";

describe("landing content", () => {
  it("has stable navigation links with unique href values", () => {
    expect(navLinks.length).toBeGreaterThanOrEqual(5);
    const hrefSet = new Set(navLinks.map((item) => item.href));
    expect(hrefSet.size).toBe(navLinks.length);

    navLinks.forEach((link) => {
      expect(link.href.startsWith("#")).toBe(true);
      expect(link.label.length).toBeGreaterThan(0);
    });

    expect(navLinks.some((link) => link.href === "#tokenomics")).toBe(false);
    expect(navLinks.some((link) => link.href === "#roadmap")).toBe(false);
    expect(navLinks.some((link) => link.href === "#community")).toBe(true);
  });

  it("contains non-empty hero and story copy blocks", () => {
    expect(heroCopy.eyebrow.length).toBeGreaterThan(0);
    expect(heroCopy.titlePrefix.length).toBeGreaterThan(0);
    expect(heroCopy.titleAccent.length).toBeGreaterThan(0);
    expect(heroCopy.description.length).toBeGreaterThan(20);

    expect(storyCopy.eyebrow.length).toBeGreaterThan(0);
    expect(storyCopy.titlePrefix.length).toBeGreaterThan(0);
    expect(storyCopy.titleAccent.length).toBeGreaterThan(0);
    expect(storyCopy.description.length).toBeGreaterThan(20);
  });

  it("contains non-empty community and footer copy", () => {
    expect(communityCopy.eyebrow).toBe("COMMUNITY");
    expect(communityCopy.titlePrefix.length).toBeGreaterThan(0);
    expect(communityCopy.titleAccent.length).toBeGreaterThan(0);
    expect(communityCopy.description.length).toBeGreaterThan(0);
    expect(footerCopy.brandStatement.length).toBeGreaterThan(0);
  });

  it("contains expected token utility item structure", () => {
    expect(tokenUtilityItems.length).toBe(4);

    tokenUtilityItems.forEach((item) => {
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.label.length).toBeGreaterThan(0);
    });
  });

  it("contains exactly three feature highlights", () => {
    expect(featureHighlights).toHaveLength(3);
    featureHighlights.forEach((highlight) => {
      expect(highlight.icon.length).toBeGreaterThan(0);
      expect(highlight.title.length).toBeGreaterThan(0);
      expect(highlight.text.length).toBeGreaterThan(0);
    });
  });

  it("contains platform cards with unique titles and valid image keys", () => {
    const titles = new Set(platformFeatureCards.map((card) => card.title));
    expect(titles.size).toBe(platformFeatureCards.length);

    platformFeatureCards.forEach((card) => {
      expect(["platform", "profile", "fans"]).toContain(card.imageKey);
      expect(["left", "right"]).toContain(card.align);
      expect(["cover", "contain"]).toContain(card.fit);
      expect(card.description.length).toBeGreaterThan(10);
    });
  });

  it("has roadmap phases with quarter/title/items", () => {
    expect(roadmapPhases.length).toBeGreaterThanOrEqual(4);

    roadmapPhases.forEach((phase) => {
      expect(phase.quarter).toMatch(/^Q[1-4]\s20/);
      expect(phase.title.length).toBeGreaterThan(0);
      expect(phase.items.length).toBeGreaterThanOrEqual(3);
      phase.items.forEach((item) => expect(item.length).toBeGreaterThan(0));
    });
  });

  it("has FAQ entries with non-empty question and answer", () => {
    expect(faqItems.length).toBeGreaterThanOrEqual(5);
    faqItems.forEach((item) => {
      expect(item.question.endsWith("?")).toBe(true);
      expect(item.answer.length).toBeGreaterThan(10);
    });
  });
});
