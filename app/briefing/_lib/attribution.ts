export type Attribution = {
  page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

export function getAttribution(): Attribution {
  const captured = captureAttribution();
  const params = new URLSearchParams(window.location.search);
  return {
    page: window.location.pathname,
    utm_source: captured?.utm_source ?? params.get("utm_source") ?? captured?.referrer ?? "",
    utm_medium: captured?.utm_medium ?? params.get("utm_medium") ?? "",
    utm_campaign: captured?.utm_campaign ?? params.get("utm_campaign") ?? "",
    utm_content: captured?.utm_content ?? params.get("utm_content") ?? "",
    utm_term: captured?.utm_term ?? params.get("utm_term") ?? "",
  };
}
import { captureAttribution } from "@/app/_lib/analytics/attribution";

