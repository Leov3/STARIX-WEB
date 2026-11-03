export type ContactAttribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

const attributionKey = "starix-contact-attribution";

export function getContactAttribution(): ContactAttribution {
  const params = new URLSearchParams(window.location.search);
  const attribution = {
    utmSource: params.get("utm_source")?.trim().slice(0, 100) || "",
    utmMedium: params.get("utm_medium")?.trim().slice(0, 100) || "",
    utmCampaign: params.get("utm_campaign")?.trim().slice(0, 100) || "",
  };

  try {
    if (Object.values(attribution).some(Boolean)) {
      sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
      return attribution;
    }
    const saved: unknown = JSON.parse(sessionStorage.getItem(attributionKey) || "{}");
    const values = saved && typeof saved === "object" ? saved as Record<string, unknown> : {};
    return {
      utmSource: typeof values.utmSource === "string" ? values.utmSource.slice(0, 100) : "",
      utmMedium: typeof values.utmMedium === "string" ? values.utmMedium.slice(0, 100) : "",
      utmCampaign: typeof values.utmCampaign === "string" ? values.utmCampaign.slice(0, 100) : "",
    };
  } catch {
    return attribution;
  }
}
