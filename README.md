# GeoCars - Full-Stack Car Rental Platform

GeoCars is a multi-role car rental platform with a Laravel 12 API, a React 19 web client, an Expo mobile app, and a small Stripe payment service. The system covers the full lifecycle from authentication and company onboarding to car posting, booking, requirement submission, rental monitoring, and subscription billing.

## Overview

GeoCars currently supports three primary experiences:

- Admin operations for user, company, plan, feature, and requirement management
- Company owner workflows for fleet management, postings, rental monitoring, payouts, and subscriptions
- Renter workflows for browsing listings, booking vehicles, uploading requirements, and tracking rental history

## Product Features

### Admin

- Admin dashboard with system summary cards and activity widgets
- User configuration with create, edit, activation, and role management
- Company configuration with nested car access and business hours setup
- Plan configuration with feature-level limits and per-plan pricing
- Requirement configuration split by role with active and required flags
- Admin profile and document views

### Company Owner

- Business dashboard with booking, trip, spend, and rating summaries
- Company profile and requirement status management
- Company configuration and operating schedule management
- Fleet management with rich car metadata and multi-image uploads
- Car postings with pricing, availability windows, comments, and listing states
- Rental management with booking detail pages, payment summaries, QR snapshots, and GPS location tracking
- Payout account management for bank and e-wallet destinations
- Subscription management with plan selection, renewal, cancellation, and Stripe payment handoff

### Renter

- Public browsing with filters and listing cards
- Booking flow and rental request detail view
- Profile management and requirement upload status
- Rental history with payment snapshots and booking details
- Mobile-first renter surface via Expo app

### Platform Services

- OAuth-style auth flow via Laravel Passport
- Swagger/OpenAPI generation for the backend API
- Generated TypeScript client support through Orval
- Stripe-backed payment service for subscription checkout
- Media handling for uploaded images and documents
- GPS/location visualization with Leaflet on the web and map-ready mobile foundations

## Repository Structure

```text
geocars-fullstack-laravel/
├── api/                     # Laravel 12 API and business logic
│   ├── app/
│   │   ├── Enum/
│   │   ├── Http/
│   │   ├── Interface/
│   │   ├── Models/
│   │   ├── Repository/
│   │   └── Service/
│   ├── database/            # Migrations, factories, seeders
│   ├── public/              # OpenAPI output, uploads, public entrypoint
│   ├── routes/              # API, web, and console routes
│   └── tests/
├── app/                     # React 19 + Vite web application
│   ├── rest/                # Orval-generated API client
│   └── src/
│       ├── components/
│       ├── layout/
│       ├── navigation/
│       ├── pages/           # admin, auth, profile, renter, status, user
│       ├── store/
│       └── types/
├── mobile/                  # Expo / React Native mobile app
│   └── src/
│       ├── app/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       └── lib/
├── stripe/                  # Express + Stripe checkout helper service
│   └── src/
├── docker/                  # Container definitions for local environments
├── GeocarsDoc/              # UI screenshot documentation grouped by role
│   ├── Admin/
│   ├── Auth/
│   ├── Renter/
│   └── User/
└── docker-compose.yml       # Root compose orchestration
```

## Tech Stack

### Backend

- Laravel 12
- PHP 8.2+
- Laravel Passport
- MySQL
- Spatie Laravel Media Library
- Stripe PHP SDK
- Swagger PHP / OpenAPI

### Web App

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Radix UI
- TanStack React Query
- React Hook Form + Zod
- Zustand
- React Router 7
- Recharts
- Leaflet and React Leaflet

### Mobile

- Expo 56
- React Native 0.85
- Expo Router
- Expo Camera
- Expo Location
- Expo Secure Store
- React Native WebView

### Payments

- Express 5
- Stripe Node SDK

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- PHP 8.2+
- Composer

### Docker Workflow

```bash
docker compose up -d
```

Expected local surfaces:

- Web app: http://localhost:3000
- Laravel API: http://localhost:8000
- phpMyAdmin: http://localhost:8080

### Local Development

#### API

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### Web App

```bash
cd app
npm install
npm run dev
```

#### Web App with Stripe Helper

```bash
cd app
npm install
npm run dev:with-stripe
```

#### Mobile App

```bash
cd mobile
npm install
npm run start
```

#### Stripe Service Only

```bash
cd stripe
npm install
npm run dev
```

## Environment Notes

### API

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=geocars
DB_USERNAME=root
DB_PASSWORD=password

PASSPORT_PRIVATE_KEY=
PASSPORT_PUBLIC_KEY=
STRIPE_SECRET=
```

### Web App

```env
VITE_API_URL=http://localhost:8000
```

### Stripe Service

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PORT=4242
```

## API Documentation

Swagger/OpenAPI output is generated by the backend:

- OpenAPI JSON: http://localhost:8000/openapi.json
- OpenAPI YAML: http://localhost:8000/openapi.yaml

Key API areas include:

- Auth
- Users and profiles
- Plans and plan features
- User companies
- Cars and car postings
- Car rentals
- Requirements and user requirements
- Payment and subscription flows

To regenerate the schema:

```bash
cd api
php artisan swagger:generate
```

To regenerate the typed web client:

```bash
cd app
npx orval
```

## Screenshot Gallery

The full UI screenshot set lives in `GeocarsDoc/`. The images below are intentionally scaled down for easier viewing in the README.

### Authentication

<p align="center">
   <img src="GeocarsDoc/Auth/login.png" alt="GeoCars login" width="48%" />
   <img src="GeocarsDoc/Auth/register.png" alt="GeoCars register" width="48%" />
</p>

### Admin Console

<p align="center">
   <img src="GeocarsDoc/Admin/admin-dashboard.png" alt="Admin dashboard" width="48%" />
   <img src="GeocarsDoc/Admin/admin-user-config1.png" alt="Admin user configuration" width="48%" />
</p>
<p align="center">
   <img src="GeocarsDoc/Admin/admin-company-config1.png" alt="Admin company configuration" width="48%" />
   <img src="GeocarsDoc/Admin/admin-plan-config2.png" alt="Admin plan features configuration" width="48%" />
</p>
<p align="center">
   <img src="GeocarsDoc/Admin/admin-requirement-config1.png" alt="Admin requirement configuration" width="48%" />
   <img src="GeocarsDoc/Admin/admin-profile1.png" alt="Admin profile" width="48%" />
</p>

### Company Owner Experience

<p align="center">
   <img src="GeocarsDoc/User/user-dashboard.png" alt="Owner dashboard" width="48%" />
   <img src="GeocarsDoc/User/user-company-config1.png" alt="Owner company configuration" width="48%" />
</p>
<p align="center">
   <img src="GeocarsDoc/User/user-manage-car1.png" alt="Owner car management" width="48%" />
   <img src="GeocarsDoc/User/user-car-posting1.png" alt="Owner car postings" width="48%" />
</p>
<p align="center">
   <img src="GeocarsDoc/User/user-car-rental1.png" alt="Owner car rental management" width="48%" />
   <img src="GeocarsDoc/User/user-car-rental4.png" alt="Owner rental location tracking" width="48%" />
</p>
<p align="center">
   <img src="GeocarsDoc/User/user-account1.png" alt="Owner payout accounts" width="48%" />
   <img src="GeocarsDoc/User/user-subscription1.png" alt="Owner subscription management" width="48%" />
</p>

### Renter Experience

<p align="center">
   <img src="GeocarsDoc/Renter/renter-browse.png" alt="Renter browse cars" width="31%" />
   <img src="GeocarsDoc/Renter/renter-rental-history.png" alt="Renter rental history" width="31%" />
   <img src="GeocarsDoc/Renter/renter-rental-history-details.png" alt="Renter rental detail" width="31%" />
</p>
<p align="center">
   <img src="GeocarsDoc/Renter/renter-profile1.png" alt="Renter profile" width="48%" />
   <img src="GeocarsDoc/Renter/renter-profile2.png" alt="Renter requirements" width="48%" />
</p>

## Testing

### Backend

```bash
cd api
php artisan test
```

### Web App

```bash
cd app
npm run lint
npm run build
```

### Mobile

```bash
cd mobile
npm run lint
```

### Stripe Service

```bash
cd stripe
npm run build
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Development Activity

[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/HolliShake/geocars-fullstack-laravel)](https://github.com/HolliShake/geocars-fullstack-laravel/graphs/commit-activity)
[![GitHub contributors](https://img.shields.io/github/contributors/HolliShake/geocars-fullstack-laravel)](https://github.com/HolliShake/geocars-fullstack-laravel/graphs/contributors)
[![GitHub last commit](https://img.shields.io/github/last-commit/HolliShake/geocars-fullstack-laravel)](https://github.com/HolliShake/geocars-fullstack-laravel/commits/main)

**Interactive Graphs:**

- [Commit Activity](https://github.com/HolliShake/geocars-fullstack-laravel/graphs/commit-activity)
- [Code Frequency](https://github.com/HolliShake/geocars-fullstack-laravel/graphs/code-frequency)
- [Contributors](https://github.com/HolliShake/geocars-fullstack-laravel/graphs/contributors)
