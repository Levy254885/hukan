import type { Property } from '@/types';

/**
 * Demo / seed properties for development.
 * Clearly marked as demo data. Replace with Firestore in production.
 */
export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop_kilimani_001',
    slug: '3-bedroom-apartment-for-rent-kilimani-nairobi-a1b2c3',
    purpose: 'rent',
    category: 'residential',
    propertyType: 'apartment',
    title: 'Spacious 3 Bedroom Apartment with Balcony',
    description:
      'Modern apartment in the heart of Kilimani. Open-plan living, fitted kitchen, master en-suite, DSQ, and secure parking. Walking distance to Yaya Centre and hospitals.',
    price: 95000,
    currency: 'KES',
    priceFrequency: 'month',
    bedrooms: 3,
    bathrooms: 2,
    size: 180,
    sizeUnit: 'sqm',
    parkingSpaces: 2,
    location: {
      country: 'Kenya',
      county: 'Nairobi',
      city: 'Nairobi',
      area: 'Kilimani',
      estate: 'Kilimani',
      coordinates: { latitude: -1.2921, longitude: 36.7856 },
    },
    amenities: {
      parking: true,
      balcony: true,
      gym: true,
      lift: true,
      dsq: true,
      cctv: true,
      gatedCommunity: true,
      fibre: true,
      backupWater: true,
      generator: true,
      furnished: false,
      serviced: false,
    },
    status: 'published',
    verificationStatus: 'verified',
    agentId: 'agent_001',
    agencyId: 'agency_abc',
    images: [
      {
        publicId: 'demo/kilimani-apt-1',
        secureUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
        alt: 'Living room view',
      },
      {
        publicId: 'demo/kilimani-apt-2',
        secureUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 1,
        isPrimary: false,
      },
    ],
    featured: true,
    views: 342,
    saves: 28,
    enquiries: 12,
    createdAt: new Date('2026-08-15'),
    updatedAt: new Date('2026-09-01'),
    publishedAt: new Date('2026-08-16'),
  },
  {
    id: 'prop_westlands_002',
    slug: '2-bedroom-apartment-for-rent-westlands-nairobi-d4e5f6',
    purpose: 'rent',
    category: 'residential',
    propertyType: 'apartment',
    title: 'Modern 2 Bedroom in Westlands',
    description:
      'Bright apartment near Westgate Mall. Fully fitted kitchen, balcony with city views, 24hr security.',
    price: 75000,
    currency: 'KES',
    priceFrequency: 'month',
    bedrooms: 2,
    bathrooms: 2,
    size: 120,
    sizeUnit: 'sqm',
    parkingSpaces: 1,
    location: {
      country: 'Kenya',
      county: 'Nairobi',
      city: 'Nairobi',
      area: 'Westlands',
      coordinates: { latitude: -1.2674, longitude: 36.8108 },
    },
    amenities: {
      parking: true,
      balcony: true,
      lift: true,
      cctv: true,
      gatedCommunity: true,
      fibre: true,
      generator: true,
    },
    status: 'published',
    verificationStatus: 'verified',
    agentId: 'agent_002',
    agencyId: 'agency_xyz',
    images: [
      {
        publicId: 'demo/westlands-1',
        secureUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
      },
    ],
    featured: false,
    views: 189,
    saves: 15,
    enquiries: 7,
    createdAt: new Date('2026-08-20'),
    updatedAt: new Date('2026-08-28'),
    publishedAt: new Date('2026-08-21'),
  },
  {
    id: 'prop_karen_003',
    slug: '4-bedroom-villa-for-sale-karen-nairobi-g7h8i9',
    purpose: 'buy',
    category: 'residential',
    propertyType: 'villa',
    title: 'Elegant 4 Bedroom Villa on Half Acre',
    description:
      'Beautiful villa in Karen with mature garden, swimming pool, staff quarters and double garage. Quiet cul-de-sac location.',
    price: 65000000,
    currency: 'KES',
    priceFrequency: 'total',
    bedrooms: 4,
    bathrooms: 4,
    size: 450,
    sizeUnit: 'sqm',
    parkingSpaces: 3,
    location: {
      country: 'Kenya',
      county: 'Nairobi',
      city: 'Nairobi',
      area: 'Karen',
      coordinates: { latitude: -1.3197, longitude: 36.7085 },
    },
    amenities: {
      parking: true,
      garden: true,
      swimmingPool: true,
      dsq: true,
      servantQuarters: true,
      cctv: true,
      electricFence: true,
      gatedCommunity: true,
      borehole: true,
      generator: true,
      solar: true,
    },
    status: 'published',
    verificationStatus: 'verified',
    agentId: 'agent_003',
    agencyId: 'agency_abc',
    images: [
      {
        publicId: 'demo/karen-villa-1',
        secureUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
      },
    ],
    featured: true,
    views: 512,
    saves: 67,
    enquiries: 23,
    createdAt: new Date('2026-07-10'),
    updatedAt: new Date('2026-09-05'),
    publishedAt: new Date('2026-07-12'),
  },
  {
    id: 'prop_ruaka_004',
    slug: '3-bedroom-maisonette-for-rent-ruaka-kiambu-j1k2l3',
    purpose: 'rent',
    category: 'residential',
    propertyType: 'maisonette',
    title: '3 Bedroom Maisonette in Gated Estate',
    description:
      'Spacious maisonette in a quiet gated community in Ruaka. DSQ, parking for 2 cars, borehole water.',
    price: 55000,
    currency: 'KES',
    priceFrequency: 'month',
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    sizeUnit: 'sqm',
    parkingSpaces: 2,
    location: {
      country: 'Kenya',
      county: 'Kiambu',
      city: 'Ruaka',
      area: 'Ruaka',
      coordinates: { latitude: -1.2045, longitude: 36.7852 },
    },
    amenities: {
      parking: true,
      garden: true,
      dsq: true,
      cctv: true,
      gatedCommunity: true,
      borehole: true,
      backupWater: true,
    },
    status: 'published',
    verificationStatus: 'verified',
    agentId: 'agent_001',
    images: [
      {
        publicId: 'demo/ruaka-1',
        secureUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
      },
    ],
    featured: false,
    views: 98,
    saves: 9,
    enquiries: 4,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-08'),
    publishedAt: new Date('2026-09-02'),
  },
  {
    id: 'prop_land_005',
    slug: '50x100-plot-for-sale-kiambu-m4n5o6',
    purpose: 'land',
    category: 'land',
    propertyType: 'residential_land',
    title: '50x100 Residential Plot – Ready Title',
    description:
      'Prime residential plot in Kiambu with ready title deed, road access, electricity and water nearby.',
    price: 3500000,
    currency: 'KES',
    priceFrequency: 'total',
    plotSize: '50x100',
    titleDeed: true,
    location: {
      country: 'Kenya',
      county: 'Kiambu',
      city: 'Kiambu',
      area: 'Kiambu Town',
      coordinates: { latitude: -1.1714, longitude: 36.8356 },
    },
    amenities: {},
    status: 'published',
    verificationStatus: 'verified',
    agentId: 'agent_004',
    images: [
      {
        publicId: 'demo/land-1',
        secureUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
      },
    ],
    featured: false,
    views: 203,
    saves: 18,
    enquiries: 9,
    createdAt: new Date('2026-08-05'),
    updatedAt: new Date('2026-08-25'),
    publishedAt: new Date('2026-08-06'),
  },
  {
    id: 'prop_lavington_006',
    slug: 'bedsitter-for-rent-lavington-nairobi-p7q8r9',
    purpose: 'rent',
    category: 'residential',
    propertyType: 'bedsitter',
    title: 'Self-Contained Bedsitter – Lavington',
    description:
      'Clean self-contained bedsitter in a secure compound. Ideal for a single professional.',
    price: 22000,
    currency: 'KES',
    priceFrequency: 'month',
    bedrooms: 0,
    bathrooms: 1,
    size: 28,
    sizeUnit: 'sqm',
    location: {
      country: 'Kenya',
      county: 'Nairobi',
      city: 'Nairobi',
      area: 'Lavington',
      coordinates: { latitude: -1.2833, longitude: 36.7667 },
    },
    amenities: {
      parking: true,
      cctv: true,
      gatedCommunity: true,
      fibre: true,
    },
    status: 'published',
    verificationStatus: 'unverified',
    agentId: 'agent_002',
    images: [
      {
        publicId: 'demo/bedsitter-1',
        secureUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        order: 0,
        isPrimary: true,
      },
    ],
    featured: false,
    views: 76,
    saves: 5,
    enquiries: 3,
    createdAt: new Date('2026-09-03'),
    updatedAt: new Date('2026-09-03'),
    publishedAt: new Date('2026-09-03'),
  },
];

/** Alias used by propertyService / listingService */
export function getDemoProperties(): Property[] {
  return DEMO_PROPERTIES;
}

export function filterDemoProperties(filters: {
  purpose?: string;
  location?: string;
  bedrooms?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
}): Property[] {
  return DEMO_PROPERTIES.filter((p) => {
    if (filters.purpose && p.purpose !== filters.purpose) return false;
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      const matches =
        p.location.area?.toLowerCase().includes(loc) ||
        p.location.city?.toLowerCase().includes(loc) ||
        p.location.county.toLowerCase().includes(loc);
      if (!matches) return false;
    }
    if (filters.bedrooms && (p.bedrooms ?? 0) < filters.bedrooms) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    return p.status === 'published';
  });
}
