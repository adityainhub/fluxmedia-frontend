/**
 * Company details used across the legal pages and Contact page.
 *
 * ⚠️ BEFORE LAUNCH: the three values marked TODO must be filled in with real
 * details. Razorpay merchant activation requires a verifiable business name and
 * address on the site, and the governing-law clause in the Terms is unenforceable
 * without a named jurisdiction. They are left as visible placeholders on purpose —
 * publishing an invented address would misrepresent the business.
 */
export const LEGAL = {
  serviceName: "fluxmedia",
  website: "https://www.fluxmedia.in",
  websiteLabel: "www.fluxmedia.in",

  // TODO: replace with the registered legal name (e.g. "Kumar Aditya, sole proprietor"
  // or the private limited company name, exactly as registered).
  legalEntityName: "[REGISTERED BUSINESS NAME — TO BE ADDED]",

  // TODO: replace with the full registered business address including PIN code.
  address: "[REGISTERED BUSINESS ADDRESS — TO BE ADDED]",

  // TODO: replace with the city whose courts have jurisdiction.
  jurisdictionCity: "[CITY]",
  jurisdictionCountry: "India",

  supportEmail: "support@fluxmedia.in",
  phoneDisplay: "+91 93340 68355",
  phoneHref: "+919334068355",

  /** Business hours for phone support, in IST. */
  supportHours: "Monday to Friday, 10:00–18:00 IST",

  /** Update whenever a policy changes materially. */
  lastUpdated: "1 September 2026",
} as const;
