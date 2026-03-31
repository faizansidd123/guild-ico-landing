import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionBlockProps = HTMLAttributes<HTMLElement> & {
  compact?: boolean;
};

type SectionContainerProps = HTMLAttributes<HTMLDivElement> & {
  maxWidthClassName?: string;
};

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

const DEFAULT_SECTION_SPACING = "py-16 lg:py-20";
const COMPACT_SECTION_SPACING = "py-12 lg:py-16";

export const SectionBlock = ({
  compact = false,
  className,
  children,
  ...rest
}: SectionBlockProps) => {
  return (
    <section
      className={cn(compact ? COMPACT_SECTION_SPACING : DEFAULT_SECTION_SPACING, "relative", className)}
      {...rest}
    >
      {children}
    </section>
  );
};

export const SectionContainer = ({
  className,
  maxWidthClassName,
  children,
  ...rest
}: SectionContainerProps) => {
  return (
    <div className={cn("container mx-auto px-6", maxWidthClassName, className)} {...rest}>
      {children}
    </div>
  );
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) => {
  const aligned = align === "center";

  return (
    <div className={cn(aligned ? "text-center" : "", className)}>
      <p className={cn("text-primary font-mono text-xs tracking-widest uppercase mb-3", aligned ? "text-center" : "")}>
        ▸ {eyebrow}
      </p>
      <h2
        className={cn(
          "text-3xl lg:text-4xl font-bold tracking-tighter",
          aligned ? "text-center" : "",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground mt-4",
            aligned ? "max-w-2xl mx-auto text-center" : "",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};
