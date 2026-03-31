const REFERRAL_STORAGE_KEY = "guild_referral_code";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

const dataLayerPush = (eventName: string, payload: EventPayload) => {
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (!Array.isArray(dataLayer)) return;
  dataLayer.push({ event: eventName, ...payload });
};

export const captureReferralFromUrl = (search: string = window.location.search) => {
  const params = new URLSearchParams(search);
  const ref = params.get("ref")?.trim();

  if (ref) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    trackEvent("referral_captured", { ref });
  }

  return ref || localStorage.getItem(REFERRAL_STORAGE_KEY);
};

export const getStoredReferral = () => localStorage.getItem(REFERRAL_STORAGE_KEY) || "";

export const trackEvent = (eventName: string, payload: EventPayload = {}) => {
  const referral = getStoredReferral();
  const fullPayload = {
    ...payload,
    referral: referral || undefined,
    ts: new Date().toISOString(),
  };

  if (import.meta.env.DEV) {
    console.info(`[analytics] ${eventName}`, fullPayload);
  }

  dataLayerPush(eventName, fullPayload);
};

export const trackPageView = (path: string) => {
  trackEvent("page_view", { path });
};
