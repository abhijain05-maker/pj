# School Bus Management

## Overview

Full-stack School Bus Management web app. Admins manage students, mark daily bus attendance (ON_BOARD / OFF_BOARD / ABSENT), and track monthly fees. Parents can publicly look up their child's status by name or phone number.

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9, Node.js 24
- **Frontend**: React + Vite + Tailwind v4 + shadcn-style UI + wouter + TanStack Query
- **Backend**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **API contract**: OpenAPI spec at `lib/api-spec/openapi.yaml`, Orval-generated React Query hooks (`@workspace/api-client-react`) and Zod schemas (`@workspace/api-zod`)

## Artifacts

- `artifacts/school-bus` — main web app (`/`)
- `artifacts/api-server` — REST API (`/api`)
- `artifacts/mockup-sandbox` — design canvas

## Domain model

- `students` — name, class, bus stop, parent name/phone, monthly fee
- `attendance` — one record per (student, date), status enum
- `fees` — one record per (student, month), status enum + paidOn

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema
