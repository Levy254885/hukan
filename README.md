# Hukan

Kenya’s property marketplace — find a place that feels right.

Production-oriented PropTech platform for buyers, renters, landlords, agents, agencies, developers, and admins across all 47 counties.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS**
- **Firebase** Auth + Firestore (abstraction ready; demo uses localStorage)
- **Cloudinary** (image pipeline ready)
- **PWA** (manifest, installable shell)
- Deploy target: **Vercel**

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Buyer  | demo@hukan.co.ke    | demo1234   |
| Agent  | agent@hukan.co.ke   | agent1234  |
| Admin  | admin@hukan.co.ke   | admin1234  |

## Features

### Core marketplace
- Search with filters (purpose, county, price, beds, amenities)
- Property detail pages with enquiry & viewing request
- Compare tray, saved properties, saved searches
- SEO landings for priority counties/areas (`/[county]/[intent]`)
- Ranking model: relevance · quality · trust · engagement · freshness (+ capped featured boost)

### Accounts & professional
- Buyer dashboard (saved, searches, enquiries, viewings, notifications)
- Agent/professional dashboard (listings, leads, analytics, billing)
- Listing wizard with **subscription quota** (Free: 3 active · Pro Monthly KES 500 · Pro Annual KES 50,000 unlimited)

### Admin
- Moderation queues, agent verification, fraud reports, platform metrics

### Advanced
- Recommendations, messaging shell, market intelligence page
- Core Web Vitals reporting (beacon + debug HUD)
- JSON-LD (Organization, WebSite, CollectionPage, BreadcrumbList)

## Monetization

Agent subscriptions (configured in `src/config/monetization.ts`):

- **Free** — up to 3 active listings
- **Pro Monthly** — KES 500 / month, unlimited listings, 1 featured credit
- **Pro Annual** — KES 50,000 / year, unlimited listings, 12 featured credits

Quota is enforced at publish time in `listingService` and gated in the list-property UI.

## Project structure

```
src/
  app/           # App Router pages (marketing, search, property, dashboards, admin, SEO)
  components/    # UI, layout, property cards, SEO helpers
  config/        # Monetization plans
  features/      # Auth provider
  hooks/         # Compare, saved properties
  lib/           # Demo data, SEO (config/ranking/metadata/structured-data), performance
  services/      # Data-access layer (property, listing, subscription, admin, …)
  types/         # Shared TypeScript models
```

## Production checklist

- [ ] Wire Firebase Auth + Firestore (replace localStorage demo services)
- [ ] Cloudinary upload pipeline + signed URLs
- [ ] Google Maps / Mapbox for map search
- [ ] M-Pesa / card payments for Pro subscriptions
- [ ] Legal pages review (terms, privacy, cookies)
- [ ] App icons (PWA) and OG images
- [ ] Firebase Security Rules + admin Cloud Functions
- [ ] Real email/SMS notifications

## License

Private — all rights reserved.
