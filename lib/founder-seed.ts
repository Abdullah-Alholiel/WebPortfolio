/**
 * Founder timeline seed — migrates the 6 hardcoded founder entries
 * (previously FOUNDER_TIMELINE in components/experience.tsx) into Upstash
 * so they are visible and editable in the admin panel.
 *
 * Root cause this fixes: those entries lived in the React component, so they
 * never reached the database. Admin could not show them, could not edit them,
 * and the Entrepreneurial journey mode was half-fake.
 *
 * Guarantees:
 *  - Idempotent: safe to run repeatedly (migration marker + per-key skip).
 *  - Additive: never deletes or overwrites an entry the user already edited.
 *  - Reversible: sets the marker so re-running is a no-op; the entries can be
 *    removed from admin like any other record.
 */

export const FOUNDER_SEED_KEY = 'portfolio:founder_seed_v1';

type FounderSeed = {
  key: string;
  title: string;
  location: string;
  description: string;
  date: string;
  icon: string;
};

/**
 * Icon names are the string ids used by StandardIcon / icon-utils.
 * The previous component used react-icons components directly (FaVideo etc.);
 * stored data must use the string names the admin picker produces.
 */
export const FOUNDER_SEEDS: FounderSeed[] = [
  {
    key: 'founder-video-analytics',
    title: 'Plug & Play Video Analytics',
    location: 'Self-founded',
    description:
      'Founded and sold a plug-and-play video analytics product for local stores, turning camera feeds into footfall and behaviour insights without custom integration work.',
    date: '01/2022 - 12/2022',
    icon: 'FaVideo',
  },
  {
    key: 'founder-ai-football-trivia',
    title: 'AI Football Trivia',
    location: 'Self-founded',
    description:
      'Founded a football trivia game powered by retrieval-augmented generation, with questions grounded in real football knowledge and adaptive difficulty.',
    date: '01/2025 - 04/2025',
    icon: 'FaFutbol',
  },
  {
    key: 'founder-saudiease',
    title: 'SaudiEase',
    location: 'Self-founded',
    description:
      'Founded a digital companion for life in Saudi Arabia: services, attractions and everyday essentials in one place for residents and visitors.',
    date: '05/2025 - 10/2025',
    icon: 'FaMapMarkedAlt',
  },
  {
    key: 'founder-momentum',
    title: 'Momentum',
    location: 'Self-founded',
    description:
      'Founded an accountability app where friends co-own tasks, log completions and keep each other\'s streaks alive across devices.',
    date: '11/2025 - 05/2026',
    icon: 'FaTasks',
  },
  {
    key: 'founder-koralink',
    title: 'KoraLink',
    location: 'Self-founded',
    description:
      'Founded a sports matchmaking platform connecting players, pitches and games, and currently leading its development.',
    date: '03/2026 - Present',
    icon: 'FaRunning',
  },
  {
    key: 'founder-knowstride',
    title: 'KnowStride',
    location: 'Self-founded',
    description:
      'Founding an enterprise upskilling platform for training agencies, with adaptive learning journeys and verifiable quality.',
    date: '07/2026 - Present',
    icon: 'FaGraduationCap',
  },
];

export function isFounderSeedItem(existing: { key?: string; title?: string }): boolean {
  if (existing?.key?.startsWith('founder-')) return true;
  return FOUNDER_SEEDS.some((s) => s.title === existing?.title);
}