/**
 * Admin service — moderation, verification, platform metrics.
 * Demo: overlays status changes on demo + published listings via localStorage.
 */

import type { Property, PropertyStatus, VerificationStatus, UserRole } from '@/types';
import { DEMO_PROPERTIES } from '@/lib/demo-data';

const MOD_KEY = 'hukan_admin_property_mods';
const USERS_KEY = 'hukan_admin_users';
const REPORTS_KEY = 'hukan_admin_reports';
const AUDIT_KEY = 'hukan_admin_audit';

export interface PropertyMod {
  status?: PropertyStatus;
  verificationStatus?: VerificationStatus;
  featured?: boolean;
  featuredUntil?: string | null;
  adminNote?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  listingsCount: number;
}

export interface FraudReport {
  id: string;
  propertyId?: string;
  reportedUserId?: string;
  reporterId?: string;
  reason: string;
  details?: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  publishedListings: number;
  pendingListings: number;
  verifiedListings: number;
  featuredListings: number;
  totalEnquiries: number;
  totalViews: number;
  agents: number;
  agencies: number;
  openReports: number;
}

function loadMods(): Record<string, PropertyMod> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(MOD_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMods(mods: Record<string, PropertyMod>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOD_KEY, JSON.stringify(mods));
}

function loadReports(): FraudReport[] {
  if (typeof window === 'undefined') return seedReports();
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      const seeded = seedReports();
      localStorage.setItem(REPORTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return seedReports();
  }
}

function saveReports(reports: FraudReport[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

function seedReports(): FraudReport[] {
  return [
    {
      id: 'rep_001',
      propertyId: 'prop_lavington_006',
      reason: 'Wrong price',
      details: 'Listed at 22k but agent quoted 28k on WhatsApp',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reporterId: 'user_demo_001',
    },
    {
      id: 'rep_002',
      propertyId: 'prop_kilimani_001',
      reason: 'Already rented',
      details: 'Visited and was told unit is taken',
      status: 'open',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

function appendAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const all: AuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    all.unshift({
      ...entry,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(all.slice(0, 200)));
  } catch {
    // ignore
  }
}

export async function getAllPropertiesForAdmin(): Promise<Property[]> {
  const mods = loadMods();
  let extra: Property[] = [];
  try {
    const raw = localStorage.getItem('hukan_agent_listings');
    if (raw) {
      extra = JSON.parse(raw).map((p: Property) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
      }));
    }
  } catch {
    // ignore
  }

  const map = new Map<string, Property>();
  [...DEMO_PROPERTIES, ...extra].forEach((p) => map.set(p.id, { ...p }));

  return Array.from(map.values()).map((p) => {
    const mod = mods[p.id];
    if (!mod) return p;
    return {
      ...p,
      status: mod.status ?? p.status,
      verificationStatus: mod.verificationStatus ?? p.verificationStatus,
      featured: mod.featured ?? p.featured,
      featuredUntil: mod.featuredUntil ? new Date(mod.featuredUntil) : p.featuredUntil,
      updatedAt: new Date(mod.updatedAt),
    };
  });
}

export async function moderateProperty(
  adminId: string,
  propertyId: string,
  action:
    | 'approve'
    | 'reject'
    | 'suspend'
    | 'delete'
    | 'feature'
    | 'unfeature'
    | 'verify'
    | 'unverify'
    | 'mark_sold'
    | 'mark_rented'
    | 'archive',
  note?: string
): Promise<void> {
  const mods = loadMods();
  const current = mods[propertyId] || {
    updatedAt: new Date().toISOString(),
    updatedBy: adminId,
  };

  switch (action) {
    case 'approve':
      current.status = 'published';
      break;
    case 'reject':
      current.status = 'rejected';
      break;
    case 'suspend':
      current.status = 'suspended';
      break;
    case 'delete':
    case 'archive':
      current.status = 'archived';
      break;
    case 'feature':
      current.featured = true;
      current.featuredUntil = new Date(Date.now() + 14 * 86400000).toISOString();
      break;
    case 'unfeature':
      current.featured = false;
      current.featuredUntil = null;
      break;
    case 'verify':
      current.verificationStatus = 'verified';
      break;
    case 'unverify':
      current.verificationStatus = 'unverified';
      break;
    case 'mark_sold':
      current.status = 'sold';
      break;
    case 'mark_rented':
      current.status = 'rented';
      break;
  }

  current.updatedAt = new Date().toISOString();
  current.updatedBy = adminId;
  if (note) current.adminNote = note;

  mods[propertyId] = current;
  saveMods(mods);

  appendAudit({
    adminId,
    action,
    targetType: 'property',
    targetId: propertyId,
    metadata: note ? { note } : undefined,
  });
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const properties = await getAllPropertiesForAdmin();
  const reports = loadReports();
  const users = await getAdminUsers();

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    totalListings: properties.length,
    publishedListings: properties.filter((p) => p.status === 'published').length,
    pendingListings: properties.filter((p) => p.status === 'pending_review').length,
    verifiedListings: properties.filter((p) => p.verificationStatus === 'verified').length,
    featuredListings: properties.filter((p) => p.featured).length,
    totalEnquiries: properties.reduce((s, p) => s + (p.enquiries || 0), 0),
    totalViews: properties.reduce((s, p) => s + (p.views || 0), 0),
    agents: users.filter((u) => u.role === 'agent' || u.role === 'agency_agent').length,
    agencies: 2,
    openReports: reports.filter((r) => r.status === 'open' || r.status === 'reviewing').length,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (typeof window === 'undefined') return seedUsers();
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const seeded = seedUsers();
      localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return seedUsers();
  }
}

function seedUsers(): AdminUser[] {
  return [
    {
      id: 'user_demo_001',
      email: 'demo@hukan.co.ke',
      displayName: 'Demo User',
      role: 'buyer',
      phone: '+254712345678',
      isVerified: true,
      status: 'active',
      createdAt: '2026-01-15T00:00:00.000Z',
      listingsCount: 0,
    },
    {
      id: 'user_agent_001',
      email: 'agent@hukan.co.ke',
      displayName: 'Jane Wanjiku',
      role: 'agent',
      phone: '+254722334455',
      isVerified: true,
      status: 'active',
      createdAt: '2025-11-01T00:00:00.000Z',
      listingsCount: 3,
    },
    {
      id: 'user_admin_001',
      email: 'admin@hukan.co.ke',
      displayName: 'Hukan Admin',
      role: 'admin',
      isVerified: true,
      status: 'active',
      createdAt: '2025-06-01T00:00:00.000Z',
      listingsCount: 0,
    },
    {
      id: 'user_agent_002',
      email: 'peter@agency.co.ke',
      displayName: 'Peter Kamau',
      role: 'agent',
      phone: '+254733445566',
      isVerified: false,
      status: 'active',
      createdAt: '2026-03-20T00:00:00.000Z',
      listingsCount: 1,
    },
  ];
}

export async function updateUserStatus(
  adminId: string,
  userId: string,
  status: AdminUser['status']
): Promise<void> {
  const users = await getAdminUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], status };
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  appendAudit({
    adminId,
    action: `user_${status}`,
    targetType: 'user',
    targetId: userId,
  });
}

export async function getReports(): Promise<FraudReport[]> {
  return loadReports().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateReportStatus(
  adminId: string,
  reportId: string,
  status: FraudReport['status']
): Promise<void> {
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx === -1) return;
  reports[idx] = {
    ...reports[idx],
    status,
    resolvedAt:
      status === 'resolved' || status === 'dismissed'
        ? new Date().toISOString()
        : reports[idx].resolvedAt,
    resolvedBy: adminId,
  };
  saveReports(reports);
  appendAudit({
    adminId,
    action: `report_${status}`,
    targetType: 'report',
    targetId: reportId,
  });
}

export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  if (typeof window === 'undefined') return [];
  try {
    const all: AuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    return all.slice(0, limit);
  } catch {
    return [];
  }
}
