type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";
let isInitialized = false;

function getGtag(): ((...args: unknown[]) => void) | null {
  if (!measurementId || typeof window === "undefined" || typeof window.gtag !== "function") {
    return null;
  }

  return window.gtag;
}

export function initAnalytics(): void {
  if (isInitialized || typeof window === "undefined" || !measurementId) {
    return;
  }

  isInitialized = true;
  window.dataLayer = window.dataLayer || [];
  // Keep the bootstrap exactly aligned with Google's snippet semantics.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export function trackPageView(path?: string): void {
  const gtag = getGtag();
  if (!gtag || typeof window === "undefined") {
    return;
  }

  const pagePath = path ?? `${window.location.pathname}${window.location.search}`;
  gtag("event", "page_view", {
    send_to: measurementId,
    page_location: window.location.href,
    page_path: pagePath,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  const gtag = getGtag();
  if (!gtag) {
    return;
  }

  gtag("event", eventName, {
    send_to: measurementId,
    ...params,
  });
}
