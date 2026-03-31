import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";

describe("section primitives", () => {
  it("renders SectionBlock with default spacing", () => {
    const { container } = render(
      <SectionBlock data-testid="section">
        <div>Content</div>
      </SectionBlock>,
    );

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("py-16");
    expect(section?.className).toContain("lg:py-20");
  });

  it("renders SectionBlock with compact spacing when requested", () => {
    const { container } = render(
      <SectionBlock compact data-testid="section">
        <div>Compact</div>
      </SectionBlock>,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("py-12");
    expect(section?.className).toContain("lg:py-16");
  });

  it("renders SectionContainer with expected base classes", () => {
    const { container } = render(
      <SectionContainer>
        <div>Container</div>
      </SectionContainer>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper?.className).toContain("container");
    expect(wrapper?.className).toContain("mx-auto");
    expect(wrapper?.className).toContain("px-6");
  });

  it("applies max width class to SectionContainer", () => {
    const { container } = render(
      <SectionContainer maxWidthClassName="max-w-4xl">
        <div>Container</div>
      </SectionContainer>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper?.className).toContain("max-w-4xl");
  });

  it("renders SectionHeading with eyebrow and title", () => {
    render(<SectionHeading eyebrow="TITLE" title="Main Heading" />);
    expect(screen.getByText("▸ TITLE")).toBeInTheDocument();
    expect(screen.getByText("Main Heading")).toBeInTheDocument();
  });

  it("renders optional description for SectionHeading", () => {
    render(<SectionHeading eyebrow="INFO" title="Hello" description="Body text" />);
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("supports left alignment without forcing center classes", () => {
    const { container } = render(<SectionHeading eyebrow="LEFT" title="Left Heading" align="left" />);
    const headingWrapper = container.firstElementChild as HTMLElement;
    expect(headingWrapper.className.includes("text-center")).toBe(false);
  });

  it("supports custom class overrides", () => {
    const { container } = render(
      <SectionHeading
        eyebrow="CUSTOM"
        title="Heading"
        description="Description"
        className="custom-wrapper"
        titleClassName="custom-title"
        descriptionClassName="custom-description"
      />,
    );

    expect(container.querySelector(".custom-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".custom-title")).toBeInTheDocument();
    expect(container.querySelector(".custom-description")).toBeInTheDocument();
  });
});
