/**
 * In-app notifications + alert architecture for saved searches.
 * Push/email remain provider-agnostic stubs.
 */

export type NotificationType =
  | 'new_match'
  | 'price_reduction'
  | 'enquiry_response'
  | 'viewing_update'
  | 'message'
  | 'listing_status'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

const KEY = 'hukan_notifications';

function load(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(list: AppNotification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  return load()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return load().filter((n) => n.userId === userId && !n.read).length;
}

export async function markRead(userId: string, id: string): Promise<void> {
  save(
    load().map((n) =>
      n.userId === userId && n.id === id ? { ...n, read: true } : n
    )
  );
}

export async function markAllRead(userId: string): Promise<void> {
  save(load().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
}

export async function createNotification(
  input: Omit<AppNotification, 'id' | 'read' | 'createdAt'>
): Promise<AppNotification> {
  const n: AppNotification = {
    ...input,
    id: `ntf_${Date.now().toString(36)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const all = load();
  all.unshift(n);
  save(all);
  return n;
}

/** Seed a couple of demo notifications for a user */
export async function ensureDemoNotifications(userId: string): Promise<void> {
  const existing = await getNotifications(userId);
  if (existing.length > 0) return;
  await createNotification({
    userId,
    type: 'system',
    title: 'Welcome to Hukan alerts',
    body: 'Save a search to get notified when matching homes are listed.',
    href: '/dashboard/searches',
  });
  await createNotification({
    userId,
    type: 'new_match',
    title: 'New match in Kilimani',
    body: 'A 3-bedroom apartment under KES 120,000 was just listed.',
    href: '/search?purpose=rent&location=Kilimani&beds=3&maxPrice=120000',
  });
}

/**
 * Alert processing stub — production would run on Cloud Functions schedule.
 * Compares active saved searches against new listings.
 */
export async function processSavedSearchAlerts(_userId: string): Promise<number> {
  // Architecture placeholder: return 0 matches in demo
  return 0;
}
