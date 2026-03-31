import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { appText } from "@/content/app-text";
import { saleConfig } from "@/config/sale";
import { getStoredReferral, trackEvent } from "@/lib/analytics";
import { notifyUnknownError, throwToastedError } from "@/lib/error-feedback";
import { SectionBlock, SectionContainer, SectionHeading } from "@/components/layout/section-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(2, appText.waitlist.validation.nameRequired),
  email: z.string().email(appText.waitlist.validation.emailRequired),
});

type WaitlistValues = z.infer<typeof schema>;

const WaitlistSection = () => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    const referral = getStoredReferral();

    try {
      const payload = {
        ...values,
        referral,
        submittedAt: new Date().toISOString(),
      };

      if (saleConfig.waitlistApiUrl) {
        const response = await fetch(saleConfig.waitlistApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok === false) {
          throwToastedError(
            `${appText.waitlist.errors.submissionFailedPrefix} (${response.status})`,
            appText.waitlist.toasts.failureTitle,
          );
        }
      } else {
        const existing = localStorage.getItem("guild_waitlist_submissions") || "[]";
        const parsed = JSON.parse(existing) as unknown[];
        localStorage.setItem("guild_waitlist_submissions", JSON.stringify([...parsed, payload]));
      }

      trackEvent("waitlist_submitted", { hasReferral: referral.length > 0 });

      toast({
        title: appText.waitlist.toasts.successTitle,
        description: appText.waitlist.toasts.successDescription,
      });

      reset();
    } catch (error) {
      notifyUnknownError(error, appText.waitlist.toasts.failureFallback, appText.waitlist.toasts.failureTitle);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SectionBlock id="community">
      <SectionContainer>
        <div className="glass-surface rounded-2xl p-8 lg:p-10 max-w-3xl mx-auto">
          <SectionHeading
            eyebrow={appText.waitlist.heading.eyebrow}
            title={appText.waitlist.heading.title}
            description={appText.waitlist.heading.description}
            className="mb-8"
            descriptionClassName="mt-3"
          />

          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">{appText.waitlist.form.nameLabel}</Label>
              <Input id="waitlist-name" placeholder={appText.waitlist.form.namePlaceholder} {...register("name")} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waitlist-email">{appText.waitlist.form.emailLabel}</Label>
              <Input id="waitlist-email" type="email" placeholder={appText.waitlist.form.emailPlaceholder} {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="md:col-span-2">
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? appText.waitlist.form.submitLoading : appText.waitlist.form.submitIdle}
              </Button>
            </div>
          </form>
        </div>
      </SectionContainer>
    </SectionBlock>
  );
};

export default WaitlistSection;
