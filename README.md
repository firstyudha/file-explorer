# 💻 File Explorer Clone

A scalable web-based file explorer clone. Built within a clean **Turborepo monorepo** with **Vue 3** (Composition API, Tailwind CSS, Pinia) on the frontend, and **Bun**, **Elysia**, and **PostgreSQL (Prisma ORM)** on the backend.

Recursive tree navigation with dynamic **Lazy Loading**, interactive breadcrumb address bars, debounced search engines, and a solid caching strategy.

---

### 🌐 Live Demo
The application is deployed on AWS Free Tier and is live here:
👉 **[Live File Explorer Clone](https://firstyudha.my.id/)**

---

## 🎨 Key Features& Visual Excellence

- **Recursive Directory Tree with Lazy Loading**: Hierarchical folder structures render recursively in the sidebar, fetching children dynamically only when expanded (holds thousands of database records smoothly without DOM overload).
- **Double-Click Main Workspace Grid**: Double-clicking folders immediately traverses the tree, pushing the route to dynamic URLs (`/folder/:id?`) representing standard Explorer address behaviors.
- **Adaptive extension colors**: Interactive premium file icons that adapt their colors based on extensions (Emerald for Excel, Blue for Word, Red for PDF, Purple for Images, Amber for Archives).
- **Interactive Address Bar (Breadcrumbs)**: Traces the exact lineage path dynamically from cache, allowing the user to click segments to navigate back to any ancestor folder.
- **Debounced Search Bar (300ms)**: Reduces server queries and network load by executing live search calls only 300ms after the user finishes typing.
- **Smart Cache-First Strategy**: Instantly serves folders that have already been opened during the session, showing loader spinner animations only for cache-misses.
- **Cache Invalidation & Refresh**: Includes a refresh trigger that invalidates the local state of the current folder and requests fresh data from the server.

---

## 🏗️ Architecture & Project Structure

The project is configured as a Monorepo using **pnpm Workspaces** and **Turborepo**, enabling fast parallel compiles, shared configurations, and caching.

```txt
file-explorer-clone/
├── apps/
│   ├── backend/               # Bun + Elysia + Prisma + PostgreSQL E2E Server
│   │   ├── prisma/            # Database schema & recursive large-scale seeder
│   │   ├── src/               # Clean Architecture modules (Explorer Module)
│   │   └── tests/             # Bun tests & Vitest API integration test suite
│   │
│   └── frontend/              # Vue 3 + Pinia + Tailwind CSS + Axios
│       ├── src/
│       │   ├── api/           # Centralized Axios network clients
│       │   ├── components/    # Reusable visual components (FileGrid, FolderTree, etc.)
│       │   ├── stores/        # Pinia caching state management
│       │   └── views/         # HomeView layout dashboard integrator
│       └── tests/             # Vitest & Vue Test Utils component tests
│
├── packages/                  # Shared Workspace Packages
│   ├── eslint-config/         # Core ESLint configurations
│   ├── tsconfig/              # Core shared TypeScript configuration templates
│   └── shared-types/          # Type contracts & DTO interfaces shared by FE & BE
│
├── docker-compose.yml         # Containerized PostgreSQL service config
├── pnpm-workspace.yaml        # Workspace mappings definition
├── turbo.json                 # Turborepo pipeline orchestration
└── README.md                  # Project documentation
```

### 🧠 Backend: Clean Architecture
The backend module `apps/backend/src/modules/explorer` enforces a strict **Separation of Concerns**:
1. **Domain Layer**: Core repository abstractions defining data contracts (`folder.repository.ts`).
2. **Infrastructure Layer**: Concrete implementation details (`prisma-folder.repository.ts`) using Prisma ORM. Securely handles type conversions (such as serializing PostgreSQL `BigInt` into safe client-side JSON strings).
3. **Application Layer (Services)**: Business logic coordinators (`folder.service.ts`) validating directory existence.
4. **Interface Layer**: HTTP Controllers and Route handlers (`explorer.routes.ts`) enforcing input validations using Elysia validation schemas.

---

## ⚡ Tech Stack & Technologies

### Frontend
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build System & Compiler**: Vite + TypeScript
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **State Management**: Pinia Store (Composition-style)
- **Routing**: Vue Router (Dynamic routes `/folder/:id?`)
- **API Client**: Axios

### Backend
- **Runtime**: Bun (Fast JavaScript/TypeScript bundler & runner)
- **Framework**: Elysia (Fast, type-safe, Zod-friendly Bun HTTP framework)
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (Containerized via Docker)

### Testing
- **Backend Tests**: Bun test & Vitest
- **Frontend Tests**: Vitest + Vue Test Utils + happy-dom (virtual DOM environment)

---

## 🚀 Installation & Setup

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) & [pnpm](https://pnpm.io/)
- [Bun](https://bun.sh/)
- [Docker & Docker Compose](https://www.docker.com/)

---

### Step 1: Install Dependencies
Run this command in the project root to install all workspaces dependencies:
```bash
pnpm install
```

---

### Step 2: Spin Up the Database Container
Start the PostgreSQL container. It maps to port `5435` by default to avoid conflicts with any local database servers running on `5432`:
```bash
docker compose up -d
```

---

### Step 3: Run Database Migrations & Seeds
Generate Prisma schemas, run migrations, and run the seeder script.
The seeder uses a recursive algorithm to generate a large-scale structure of **1,096 folders and 5,440 files** up to **5 levels of depth**:
```bash
# Enter apps/backend to perform database operations
cd apps/backend

# Apply schema migrations
pnpm db:migrate

# Populate with simulated large-scale data
pnpm db:seed
```
*(Optional) You can verify the integrity of the populated database by running our validation script `bun prisma/check-db.ts`.*

---

### Step 4: Run Dev Servers
Run both the Elysia backend server (`http://localhost:3000`) and the Vue 3 frontend Vite dev server (`http://localhost:5173`) in parallel using Turborepo:
```bash
# Execute from root directory
pnpm dev
```
Open **`http://localhost:5173`** in your browser to experience the application.

---

## 🧪 Running Tests

We maintain complete automated testing suites with 100% success targets:

### Run All Workspace Tests
You can run all tests across both backend and frontend applications using Turborepo from the root directory:
```bash
pnpm test
```

### Run Backend Tests Only
Tests core repository operations, service domain fallback logic, and Elysia API route payloads:
```bash
pnpm --filter @apps/backend test
```

### Run Frontend Tests Only
Tests Pinia state management caches and validates visual component renders recursive structures, debounced search triggers, address breadcrumbs, and double clicks in a virtual browser DOM:
```bash
pnpm --filter @apps/frontend test
```

---

## ☁️ AWS Free Tier & CI/CD Deployment

The project is pre-configured with a premium, fully automated **GitHub Actions CI/CD Pipeline** designed to build, test, and deploy both frontend and backend architectures to **AWS Free Tier** (AWS EC2 + AWS RDS PostgreSQL).

### 🏛️ Production Architecture
- **Web Server (AWS EC2)**: A single `t3.micro` instance running **Nginx** serves the static Vue 3 production files from `/var/www/html` and reverse-proxies API calls under `/api` to the Elysia backend running locally on port `3000` (managed by `PM2` using the fast Bun runtime). This avoids CORS issues entirely and has an ultra-low memory footprint (<80MB RAM).
- **Database (AWS RDS)**: A PostgreSQL database instance `db.t4g.micro` provides durable, persistent, and secure database storage.

### ⚙️ GitHub Actions CI/CD Setup

Whenever a push is made to the `main` branch, the pipeline will:
1. Spin up a virtual runner, install Bun, Node.js, and `pnpm`.
2. Cache dependencies, install packages, and generate the Prisma client.
3. Run Vitest test suites.
4. Build the production bundles for both Vue 3 frontend and Elysia backend.
5. Deploy frontend static assets to EC2 via secure `rsync`.
6. Deploy backend bundles to EC2, run Prisma migrations against RDS (`bun prisma migrate deploy`), and restart the service under **PM2** process supervision.
