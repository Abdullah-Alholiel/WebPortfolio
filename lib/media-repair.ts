import { listAllBlobs, DEFAULT_PREFIX } from './blob';
import { buildBlobPath, isRemoteUrl, stripLeadingSlashes } from './image-utils';

type BlobInventory = Map<string, string>;

const HASH_SUFFIX_REGEX = /-([A-Za-z0-9]{16,})$/;

function decodePathComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toInventoryKey(pathname: string): string | null {
  const normalized = decodePathComponent(stripLeadingSlashes(pathname));
  if (!normalized.startsWith(`${DEFAULT_PREFIX}/`)) {
    return null;
  }
  const relative = normalized.slice(DEFAULT_PREFIX.length + 1);
  const lastDotIndex = relative.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === relative.length - 1) {
    return relative;
  }
  const namePart = relative.slice(0, lastDotIndex);
  const extension = relative.slice(lastDotIndex);
  const hashMatch = namePart.match(HASH_SUFFIX_REGEX);
  if (hashMatch) {
    const base = namePart.slice(0, namePart.length - hashMatch[0].length);
    if (base.length > 0) {
      return `${base}${extension}`;
    }
  }
  return relative;
}

function normalizeToPathname(value: string): string | null {
  if (!value) {
    return null;
  }
  if (isRemoteUrl(value)) {
    try {
      const parsed = new URL(value);
      return decodePathComponent(stripLeadingSlashes(parsed.pathname));
    } catch {
      return null;
    }
  }
  return decodePathComponent(stripLeadingSlashes(value));
}

function resolveBlobReference(value: string | undefined | null, inventory: BlobInventory) {
  if (typeof value !== 'string' || value.length === 0) {
    return { value, changed: false };
  }

  const normalizedPath = normalizeToPathname(value);
  if (!normalizedPath || !normalizedPath.startsWith(`${DEFAULT_PREFIX}/`)) {
    return { value, changed: false };
  }

  const inventoryKey = toInventoryKey(normalizedPath);
  if (!inventoryKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[media-repair] Unable to derive inventory key for value:', value);
    }
    return { value, changed: false };
  }

  let desiredPathname: string | undefined;
  for (const variant of withVariants(inventoryKey)) {
    const match = inventory.get(variant);
    if (match) {
      desiredPathname = match;
      break;
    }
  }
  if (!desiredPathname) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[media-repair] No blob match found for key:', inventoryKey);
    }
    return { value, changed: false };
  }

  const desiredFull = buildBlobPath(desiredPathname);
  if (normalizedPath === desiredPathname || value === desiredFull) {
    return { value, changed: false };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[media-repair] Repaired media reference', {
      original: value,
      resolved: desiredFull,
    });
  }

  return { value: desiredFull, changed: true };
}

function withVariants(relativePath: string): string[] {
  const variants = new Set<string>();
  variants.add(relativePath);
  variants.add(decodePathComponent(relativePath));
  variants.add(encodeURI(relativePath));
  variants.add(encodeURIComponent(relativePath));
  variants.add(relativePath.replace(/ /g, '%20'));
  variants.add(relativePath.replace(/%20/g, ' '));
  return Array.from(variants).filter(Boolean);
}

export async function buildBlobInventory(prefix?: string): Promise<BlobInventory> {
  let blobs;
  try {
    blobs = await listAllBlobs({ prefix: prefix ?? DEFAULT_PREFIX });
  } catch (error) {
    console.warn('[media-repair] Failed to load blob inventory:', error);
    return new Map();
  }

  if (!blobs || blobs.length === 0) {
    console.warn(
      `[media-repair] Blob inventory is empty. Verify tokens (BLOB_READ_ONLY_TOKEN) and that assets exist under ${prefix ?? DEFAULT_PREFIX}.`,
    );
    return new Map();
  }
  const inventory: BlobInventory = new Map();

  for (const blob of blobs) {
    const key = toInventoryKey(blob.pathname);
    if (key) {
      const variants = withVariants(key);
      for (const variant of variants) {
        inventory.set(variant, blob.pathname);
      }
    }
  }

  return inventory;
}

type RepairResult<T> = {
  data: T;
  changed: boolean;
};

function repairRecord<T extends Record<string, any>>(
  record: T,
  fields: Array<keyof T>,
  inventory: BlobInventory,
): RepairResult<T> {
  let changed = false;
  const updated: T = { ...record };

  for (const field of fields) {
    const current = updated[field];
    const { value, changed: fieldChanged } = resolveBlobReference(current, inventory);
    if (fieldChanged) {
      // Only assign if value is not undefined, to avoid type errors when T[keyof T] does not allow undefined
      updated[field] = value as T[keyof T];
      changed = true;
    }
  }

  return { data: updated, changed };
}

export type PortfolioDataPayload = {
  personal: Record<string, any> | null;
  projects: any[];
  experiences: any[];
  skills: any;
  achievements: any[];
  mentorship: any[];
};

export type PortfolioRepairResult = {
  personal: RepairResult<PortfolioDataPayload['personal']>;
  projects: RepairResult<PortfolioDataPayload['projects']>;
  achievements: RepairResult<PortfolioDataPayload['achievements']>;
  mentorship: RepairResult<PortfolioDataPayload['mentorship']>;
};

export async function repairPortfolioMedia(data: PortfolioDataPayload): Promise<PortfolioRepairResult> {
  const inventory = await buildBlobInventory();
  if (inventory.size === 0) {
    console.warn('[media-repair] Proceeding without inventory, media references will remain unchanged.');
  }

  const personalResult: RepairResult<PortfolioDataPayload['personal']> = (() => {
    if (!data.personal) {
      return { data: null, changed: false };
    }
    const { data: repaired, changed } = repairRecord(
      data.personal,
      ['profileImageUrl', 'cvLink'] as Array<keyof typeof data.personal>,
      inventory,
    );
    return { data: repaired, changed };
  })();

  const projectResult = (() => {
    if (!Array.isArray(data.projects)) {
      return { data: [], changed: false };
    }
    let changed = false;
    const repaired = data.projects.map((project) => {
      const { data: updatedProject, changed: projectChanged } = repairRecord(
        project,
        ['imageUrl', 'certificateUrl', 'fallbackImageUrl'],
        inventory,
      );
      if (projectChanged) {
        changed = true;
      }
      return updatedProject;
    });
    return { data: repaired, changed };
  })();

  const achievementsResult = (() => {
    if (!Array.isArray(data.achievements)) {
      return { data: [], changed: false };
    }
    let changed = false;
    const repaired = data.achievements.map((achievement) => {
      const { data: updatedAchievement, changed: achChanged } = repairRecord(
        achievement,
        ['imageUrl', 'certificateUrl', 'fallbackCertificateUrl'],
        inventory,
      );
      if (achChanged) {
        changed = true;
      }
      return updatedAchievement;
    });
    return { data: repaired, changed };
  })();

  const mentorshipResult = (() => {
    if (!Array.isArray(data.mentorship)) {
      return { data: [], changed: false };
    }
    let changed = false;
    const repaired = data.mentorship.map((item) => {
      const { data: updatedItem, changed: itemChanged } = repairRecord(
        item,
        ['imageUrl', 'certificateUrl', 'fallbackImageUrl', 'fallbackCertificateUrl'],
        inventory,
      );
      if (itemChanged) {
        changed = true;
      }
      return updatedItem;
    });
    return { data: repaired, changed };
  })();

  return {
    personal: personalResult,
    projects: projectResult,
    achievements: achievementsResult,
    mentorship: mentorshipResult,
  };
}

