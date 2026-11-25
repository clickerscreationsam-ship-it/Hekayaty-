import fs from 'fs';
import path from 'path';

export type PublicationStatus = 'draft' | 'in_progress' | 'ready_to_publish' | 'published' | 'archived';

interface PublicationRecord {
  id: string;
  type: 'story' | 'comic';
  status: PublicationStatus;
  updatedAt: string;
  metadata?: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'artifacts/api-server/data');
const DATA_FILE = path.join(DATA_DIR, 'publication_statuses.json');

// In-memory cache
let statusMap = new Map<string, PublicationRecord>();

function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed: Record<string, PublicationRecord> = JSON.parse(raw);
      statusMap = new Map(Object.entries(parsed));
    }
  } catch (err) {
    console.error('Failed to initialize publication status store:', err);
  }
}

function persistStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(statusMap.entries());
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist publication status store:', err);
  }
}

// Initial load
ensureStorage();

export function getPublicationStatus(id: string): PublicationStatus {
  const record = statusMap.get(id);
  // Default: if not explicitly recorded as draft/in_progress, existing seeded content is published
  return record ? record.status : 'published';
}

export function setPublicationStatus(
  id: string,
  type: 'story' | 'comic',
  status: PublicationStatus,
  metadata?: any
): void {
  const existing = statusMap.get(id);
  statusMap.set(id, {
    id,
    type,
    status,
    updatedAt: new Date().toISOString(),
    metadata: { ...(existing?.metadata || {}), ...(metadata || {}) },
  });
  persistStorage();
}

export function isDraft(id: string): boolean {
  const s = getPublicationStatus(id);
  return s === 'draft' || s === 'in_progress' || s === 'ready_to_publish';
}

export function isPublished(id: string): boolean {
  return getPublicationStatus(id) === 'published';
}

export function getAllStatuses(): Record<string, PublicationRecord> {
  return Object.fromEntries(statusMap.entries());
}
