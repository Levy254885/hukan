// Core Hukan Types
// Production-grade TypeScript interfaces for the Kenyan property marketplace

export type UserRole =
  | 'visitor'
  | 'buyer'
  | 'tenant'
  | 'owner'
  | 'landlord'
  | 'agent'
  | 'agency_admin'
  | 'agency_agent'
  | 'developer'
  | 'developer_staff'
  | 'property_manager'
  | 'admin'
  | 'super_admin'
  | 'moderator';

export type PropertyPurpose = 'buy' | 'rent' | 'land' | 'commercial';

export type PropertyCategory =
  | 'residential'
  | 'land'
  | 'commercial';

export type ResidentialType =
  | 'apartment'
  | 'bedsitter'
  | 'studio'
  | 'maisonette'
  | 'bungalow'
  | 'townhouse'
  | 'villa'
  | 'penthouse'
  | 'duplex'
  | 'cottage'
  | 'mansion'
  | 'shared_house';

export type LandType =
  | 'residential_land'
  | 'commercial_land'
  | 'agricultural_land'
  | 'industrial_land'
  | 'mixed_use_land';

export type CommercialType =
  | 'office'
  | 'shop'
  | 'retail'
  | 'warehouse'
  | 'hotel'
  | 'industrial'
  | 'restaurant'
  | 'building'
  | 'mixed_use';

export type PropertyType = ResidentialType | LandType | CommercialType;

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'sold'
  | 'rented'
  | 'archived'
  | 'reserved';

export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'expired';

export type Currency = 'KES';

export type PriceFrequency = 'total' | 'month' | 'year' | 'sqm' | 'acre';

export type SizeUnit = 'sqm' | 'sqft' | 'acre' | 'ha';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Location {
  country: 'Kenya';
  county: string;
  city?: string;
  area?: string;
  estate?: string;
  street?: string;
  postalCode?: string;
  coordinates?: GeoPoint;
}

export interface PropertyImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  order: number;
  isPrimary: boolean;
  alt?: string;
}

export interface AmenityFlags {
  parking?: boolean;
  balcony?: boolean;
  garden?: boolean;
  swimmingPool?: boolean;
  gym?: boolean;
  lift?: boolean;
  dsq?: boolean;
  servantQuarters?: boolean;
  cctv?: boolean;
  electricFence?: boolean;
  gatedCommunity?: boolean;
  borehole?: boolean;
  backupWater?: boolean;
  generator?: boolean;
  solar?: boolean;
  fibre?: boolean;
  airConditioning?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  serviced?: boolean;
  guard?: boolean;
  waterIncluded?: boolean;
  electricityIncluded?: boolean;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  purpose: PropertyPurpose;
  category: PropertyCategory;
  propertyType: PropertyType;
  status: PropertyStatus;
  verificationStatus: VerificationStatus;
  price: number;
  currency: Currency;
  priceFrequency?: PriceFrequency;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: SizeUnit;
  plotSize?: string;
  parkingSpaces?: number;
  location: Location;
  amenities?: AmenityFlags;
  images: PropertyImage[];
  videoUrl?: string;
  virtualTourUrl?: string;
  agentId: string;
  agencyId?: string;
  ownerId?: string;
  featured?: boolean;
  featuredUntil?: Date;
  views: number;
  enquiries: number;
  saves: number;
  titleDeed?: boolean;
  availableFrom?: string;
  yearBuilt?: number;
  floors?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Agent {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL?: string;
  bio?: string;
  agencyId?: string;
  agencyName?: string;
  licenseNumber?: string;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  activeListings: number;
  subscriptionPlan: 'free' | 'pro_monthly' | 'pro_annual';
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logoURL?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  location?: Location;
  verified: boolean;
  agentCount: number;
  listingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  roles?: UserRole[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  purpose: PropertyPurpose;
  location?: string;
  propertyTypes?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: Partial<AmenityFlags>;
  keywords?: string[];
  notificationFrequency: 'instant' | 'daily' | 'weekly' | 'none';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastNotifiedAt?: Date;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  userId?: string;
  agentId?: string;
  agencyId?: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  source: 'website' | 'whatsapp' | 'phone' | 'viewing';
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'interested' | 'closed' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  userId?: string;
  agentId?: string;
  preferredDate: string;
  preferredTime: string;
  alternativeTime?: string;
  message?: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  purpose?: PropertyPurpose;
  location?: string;
  county?: string;
  area?: string;
  propertyTypes?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSize?: number;
  maxSize?: number;
  furnished?: boolean;
  serviced?: boolean;
  amenities?: Partial<AmenityFlags>;
  keywords?: string[];
  sort?: 'recommended' | 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'size_desc' | 'size_asc' | 'relevance';
  page?: number;
  limit?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Kenyan Counties (all 47)
export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
] as const;

export type KenyanCounty = typeof KENYAN_COUNTIES[number];
