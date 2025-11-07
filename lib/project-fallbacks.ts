import { stripLeadingSlashes } from './image-utils';

const fallbackImageMap: Record<string, string> = {
  'AI-Powered Trivia Web Game': '/ai-trivia-game.png',
  'Multi-Agent AI Agency Platform': '/ai-agency.png',
  'Ride Hailing Application': '/ride-hailing-app.png',
  'Cloud of Things Solution for Smart Parking Management': '/cloud-of-things.png',
  'Database and Big Data Modelling for Digital Migration Company': '/digital-migration.png',
  'Cloud-Based Hybrid Migration Software Development using Azure': '/azure-hybrid.jpeg',
  'E-commerce Store Development': '/ecommerce.png',
  'Design and Simulation of a Fully Electric Aircraft': '/electric-aircraft-img.png',
};

function inferFromRemoteUrl(remoteUrl?: string | null): string | null {
  if (!remoteUrl) {
    return null;
  }

  let filename = remoteUrl;
  try {
    const url = new URL(remoteUrl);
    filename = url.pathname;
  } catch {
    // ignore parsing errors, treat as path
  }

  const trimmed = stripLeadingSlashes(filename);
  if (!trimmed) {
    return null;
  }

  const segments = trimmed.split('/');
  const lastSegment = segments.pop();
  if (!lastSegment) {
    return null;
  }

  const match = lastSegment.match(/^(.*?)(-[A-Za-z0-9]{6,})?\.(png|jpe?g)$/i);
  if (!match) {
    return null;
  }

  const baseName = match[1];
  const extension = match[3]?.toLowerCase();
  if (!baseName || !extension) {
    return null;
  }

  return `/${baseName}.${extension}`;
}

export function getProjectFallbackImage(options: {
  title?: string | null;
  remoteUrl?: string | null;
  fallbackCandidate?: string | null;
}): string | null {
  const { title, remoteUrl, fallbackCandidate } = options;

  if (fallbackCandidate && typeof fallbackCandidate === 'string' && fallbackCandidate.length > 0) {
    if (fallbackCandidate.startsWith('/')) {
      return fallbackCandidate;
    }
    return `/${stripLeadingSlashes(fallbackCandidate)}`;
  }

  if (title) {
    const mapped = fallbackImageMap[title];
    if (mapped) {
      return mapped;
    }
  }

  const inferred = inferFromRemoteUrl(remoteUrl);
  if (inferred) {
    return inferred;
  }

  return null;
}

