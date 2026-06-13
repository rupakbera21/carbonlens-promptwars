# 🌿 CarbonLens — Carbon Footprint Tracking & Reduction Platform

> A production-grade Progressive Web Application that helps individuals understand, track, and reduce their personal carbon footprint through transparent scoring, personalized insights, and actionable recommendations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Project Overview

CarbonLens is a **carbon footprint tracking and reduction platform** designed with Clean Architecture principles, WCAG 2.2 AA accessibility, GDPR compliance, and production-grade scalability.

### Why CarbonLens?

| Feature         | Typical Calculator | CarbonLens                                  |
| --------------- | ------------------ | ------------------------------------------- |
| Tracking        | One-time survey    | Continuous daily logging                    |
| Transparency    | Black-box score    | Every factor cited with source              |
| Recommendations | Generic tips       | Configurable rule-engine-driven suggestions |
| Offline Support | None               | Full PWA with service worker                |
| Accessibility   | Partial/None       | WCAG 2.2 AA compliant                       |
| Data Ownership  | Vendor-locked      | Full JSON export, right to delete           |

---

## ✨ Features

### 1. Carbon Footprint Dashboard

- Track **transportation**, **electricity**, **food**, and **shopping** emissions
- Real-time score updates with animated visualizations
- Per-category breakdown with accessible data tables
- **Interactive 3D Living World / Solar System**: A dynamic 3D simulation built with React Three Fiber representing your carbon footprint health index. The system scales by generating orbiting planets with distinct, deterministic sizes and clean planetary spacing, with jitter-free visuals.

### 2. Smart Carbon Score (0-100)

- **Fully explainable** — every gram of CO₂e is traceable to its emission factor
- Linear score: `score = 100 × (1 - CO₂e / 200kg)` (weekly)
- Score explanation text changes based on range

### 3. Personalized Recommendations

- Driven by a **configurable rule engine** stored in the database
- Zero hardcoded business logic in the UI
- Rules define conditions (JSON) and actions (recommendations)
- Example: "If car usage > 100 km/week → suggest public transport"

### 4. Goal Tracking

- Set monthly carbon reduction targets
- Visual progress tracking with percentage indicators
- Auto-cancellation of previous goals on new goal creation

### 5. Insights Engine

- Weekly and monthly trend charts (Recharts)
- Week-over-week comparison
- Largest emission category identification
- Estimated savings opportunities

### 6. Accessibility Mode

- High contrast mode (7:1 ratio)
- Reduced motion (respects `prefers-reduced-motion`)
- Screen reader optimizations (ARIA landmarks, live regions, data tables)
- Keyboard navigation with visible focus indicators

### 7. Offline Support (PWA)

- Service worker with strategy-based caching
- Offline fallback page
- Installable as a Progressive Web App

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation (UI)           │  Next.js pages, React components
├─────────────────────────────────────┤
│       Application (Services)        │  Orchestration, rule engine, DTOs
├─────────────────────────────────────┤
│          Domain (Core)              │  Entities, value objects, interfaces
├─────────────────────────────────────┤
│      Infrastructure (Adapters)      │  Prisma repos, auth, cache, middleware
└─────────────────────────────────────┘
```

### Key Design Decisions

- **Modular Monolith** — chosen over microservices for operational simplicity (scored 4.6/5 in weighted decision matrix)
- **Repository Pattern** — domain defines interfaces; infrastructure implements with Prisma
- **Pre-computed scores** — stored in `carbon_scores` table to avoid expensive re-aggregation
- **JSON Rule Engine** — recommendations are fully configurable without code deployment

---

## 📁 Folder Structure

```
carbonlens/
├── .github/workflows/      # CI/CD pipelines
├── docker/                  # Dockerfile & docker-compose
├── prisma/                  # Schema, migrations, seed data
├── public/                  # PWA assets (manifest, SW, offline page)
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   ├── domain/              # Entities, value objects, repository interfaces
│   ├── application/         # Services, rule engine, DTOs
│   ├── infrastructure/      # Prisma repos, auth, middleware
│   ├── presentation/        # UI components, hooks, providers
│   ├── shared/              # Zod schemas, types, constants, utilities
│   └── __tests__/           # Unit, integration, E2E tests
└── [config files]           # TypeScript, Tailwind, ESLint, Prettier, etc.
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** ≥ 20.0.0
- **PostgreSQL** 16+ (or use Docker)
- **npm** ≥ 10

### 1. Clone & Install

```bash
git clone https://github.com/your-org/carbonlens.git
cd carbonlens
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### 3. Database Setup

**Option A: Docker (recommended)**

```bash
npm run docker:up         # Starts PostgreSQL + Redis
npx prisma migrate dev    # Run migrations
npm run db:seed           # Seed emission factors & rules
```

**Option B: Existing PostgreSQL**

```bash
# Update DATABASE_URL in .env
npx prisma migrate dev
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:** `demo@carbonlens.app` / `Demo1234!`

---

## 🧪 Running Tests

### Unit & Integration Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### E2E Tests

```bash
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI mode
```

### Linting & Type Checking

```bash
npm run lint              # ESLint + Prettier
npm run type-check        # TypeScript compilation
```

---

## 🐳 Deployment

### Vercel + Supabase (Recommended)

When deploying to Vercel with a Supabase database, Vercel build servers block IPv6 connections, preventing automatic database migrations (`prisma db push`). We completely bypass this limitation using a raw SQL setup script:

1. Deploy the repository to Vercel (the build script automatically skips database pushing).
2. Connect a Supabase integration to your Vercel project.
3. Open your Supabase Dashboard -> **SQL Editor**.
4. Copy the contents of `setup.sql` from the root of this repository.
5. Paste into the SQL Editor, select **Run without RLS**, and execute.
6. Your database is now fully populated with tables, seed data, and a demo user!

### Docker Production Build

```bash
docker build -f docker/Dockerfile -t carbonlens .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://your-domain.com" \
  carbonlens
```

### Docker Compose (Full Stack)

```bash
docker compose -f docker/docker-compose.yml up -d
```

### CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Lint & Type Check** — ESLint, Prettier, TypeScript
2. **Unit Tests** — Vitest with PostgreSQL service container
3. **E2E Tests** — Playwright with Chromium
4. **Docker Build** — Validates production image builds

---

## 🔒 Security Measures

| Area              | Implementation                                          |
| ----------------- | ------------------------------------------------------- |
| **OWASP A01**     | Row-level security via `userId` checks on all queries   |
| **OWASP A02**     | bcrypt (cost 12) for passwords; TLS 1.3 in transit      |
| **OWASP A03**     | Prisma parameterized queries; Zod input validation      |
| **OWASP A05**     | Non-root Docker; CSP, HSTS, X-Frame-Options headers     |
| **OWASP A06**     | `npm audit` in CI; Dependabot alerts                    |
| **OWASP A07**     | NextAuth with JWT sessions; rate-limited auth endpoints |
| **OWASP A09**     | Structured logging; no PII in logs                      |
| **Rate Limiting** | 100 req/min general; 5 req/min for auth endpoints       |
| **GDPR**          | Data export, right to erasure, data minimization        |

---

## ♿ Accessibility Compliance

WCAG 2.2 AA compliance achieved through:

- **Skip-to-content link** on every page
- **ARIA landmarks** (`<nav>`, `<main>`, `<aside>`) on all regions
- **Visible focus indicators** with 3:1 contrast
- **Color-independent information** — icons + text alongside colors
- **Screen reader data tables** for chart data
- **`aria-live` regions** for dynamic score updates
- **Reduced motion** respects `prefers-reduced-motion` + manual toggle
- **High contrast mode** with 7:1 ratio available in settings
- **Touch targets** ≥ 44×44px
- **Responsive design** tested at 320px through 1440px

---

## 📈 Scalability Considerations

| Phase      | Users | Strategy                                         |
| ---------- | ----- | ------------------------------------------------ |
| MVP        | 10K   | Single PostgreSQL + single app container         |
| Growth     | 100K  | Read replicas, horizontal scaling, CDN           |
| Scale      | 1M    | Database partitioning, event-driven architecture |
| Enterprise | 1M+   | Multi-region, sharding, ML recommendations       |

---

## 📝 Assumptions

1. Users log activities manually (no IoT integration in v1)
2. Emission factors are global averages; regional variants can be added via seed data
3. Score calculation uses a weekly window for responsiveness
4. One active goal per user at a time (previous auto-cancelled)
5. Authentication uses email/password; OAuth providers can be added to NextAuth config

---

## 🔮 Future Improvements

- **AI-Powered Recommendations** — ML model trained on anonymized activity patterns
- **Household Tracking** — Multi-user goals and shared dashboards
- **IoT Integration** — Smart meter and car OBD-II data import
- **Social Features** — Community challenges and leaderboards
- **GraphQL API** — Flexible queries for mobile app
- **Multi-language** — i18n with `next-intl`
- **White-label** — Enterprise customization for corporate sustainability programs

---

## ⚖️ Trade-offs

| Decision                 | Trade-off               | Rationale                                                |
| ------------------------ | ----------------------- | -------------------------------------------------------- |
| Modular Monolith         | Less micro-independence | Simpler ops; can extract services later                  |
| Pre-computed scores      | Slight staleness        | Avoids N+1 queries on dashboard load                     |
| JSON rule engine         | Less powerful than DSL  | Zero supply-chain risk; fully auditable                  |
| In-memory rate limiter   | Not distributed         | Sufficient for single-instance; Redis swap documented    |
| Synchronous score recalc | Slight latency on POST  | Simpler than message queue; async planned for >10K users |

---

## 🎯 Performance Targets

| Metric     | Target | Technique                                 |
| ---------- | ------ | ----------------------------------------- |
| Lighthouse | >95    | SSR, optimized images, minimal JS         |
| FCP        | <1.5s  | Server-side rendering, critical CSS       |
| LCP        | <2.5s  | Lazy-loaded charts, preloaded fonts       |
| CLS        | <0.1   | Explicit dimensions, `font-display: swap` |
| API P95    | <150ms | Indexed queries, connection pooling       |

---

## 🤝 Contribution Guide

1. **Fork** the repository
2. **Create a feature branch** from `main`
3. **Follow the architecture** — domain logic in `domain/`, UI in `presentation/`
4. **Write tests** — minimum 90% coverage for domain/application layers
5. **Run checks** before PR: `npm run lint && npm run type-check && npm run test`
6. **Submit PR** with description of changes
7. **Code review** required from at least 1 team member

### Code Style

- TypeScript strict mode
- ESLint + Prettier (auto-formatted on save)
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Comments only for business reasoning, not obvious code

---

## 🔧 Troubleshooting

### Database connection error

```bash
# Verify PostgreSQL is running
docker compose -f docker/docker-compose.yml ps
# Check DATABASE_URL in .env
```

### Prisma client not generated

```bash
npx prisma generate
```

### Port 3000 already in use

```bash
# Kill existing process or use different port
PORT=3001 npm run dev
```

### Tests failing with database errors

```bash
# Ensure test database exists and migrations are applied
DATABASE_URL="..." npx prisma migrate deploy
```

### Windows ARM64 / Apple Silicon VM compatibility issues (Prisma dll error)

If you are running on a Windows ARM64 architecture (e.g., Snapdragon laptops or virtualization on ARM hosts) and receive a `query_engine-windows.dll.node is not a valid Win32 application` error from Prisma:
1. Configure the Prisma engines to use binary execution rather than node-api library files. Add the following to your `.env` file:
   ```env
   PRISMA_CLI_QUERY_ENGINE_TYPE="binary"
   PRISMA_CLIENT_ENGINE_TYPE="binary"
   ```
2. Regenerate the client:
   ```bash
   npx prisma generate
   ```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with 🌿 for a sustainable future</p>
</div>
