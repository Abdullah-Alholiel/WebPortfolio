/**
 * Site copy store — every user-visible heading/subheading that is NOT an
 * array item (those live in their own collections).
 *
 * Why this exists: section titles like "Achievements" / "Professional
 * certifications and accomplishments" were hardcoded in the components, so
 * "all text editable in admin" was impossible for them. This central store
 * makes them data, with the original wording as the default so a fresh
 * install renders exactly as before.
 *
 * Access pattern: resolveCopy(copy, 'achievements.title') so a missing key
 * can never crash a render.
 */

export const SITE_COPY_DEFAULTS: Record<string, string> = {
  "achievements.title": "Achievements",
  "achievements.subtitle": "Professional certifications and accomplishments",
  "mentorship.title": "Mentorship Experiences",
  "mentorship.subtitle": "Real-world simulations and professional development opportunities",
  "projects.title": "Projects",
  "skills.title": "Skills",
  "founder.title": "Founder",
  "contact.title": "Contact me",
  "experience.title.professional": "Professional Journey",
  "experience.title.entrepreneurial": "Entrepreneurial Journey",
  "experience.mode.professional": "Professional",
  "experience.mode.entrepreneurial": "Entrepreneurial",
  "founder.cta.label": "Explore the ventures",
  "founder.cta.journey": "Follow the journey",
};

export type SiteCopy = Record<string, string>;

/** Resolve a copy key with a safe fallback chain. */
export function resolveCopy(
  copy: SiteCopy | undefined | null,
  key: string,
  fallback?: string
): string {
  const value = copy ? copy[key] : undefined;
  if (typeof value === "string" && value.trim() !== "") return value;
  if (fallback !== undefined) return fallback;
  return SITE_COPY_DEFAULTS[key] ?? key;
}
