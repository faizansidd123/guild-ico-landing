import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { appText } from "@/content/app-text";
import { faqItems } from "@/content/landing-content";

const FAQSection = () => {
  return (
    <SectionBlock id="faq">
      <SectionContainer maxWidthClassName="max-w-3xl">
        <SectionHeading
          eyebrow={appText.faq.heading.eyebrow}
          title={appText.faq.heading.title}
          className="mb-8"
        />

        <Accordion type="single" collapsible className="glass-surface rounded-xl px-6">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContainer>
    </SectionBlock>
  );
};

export default FAQSection;
