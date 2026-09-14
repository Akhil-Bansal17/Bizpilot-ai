# BizPilot AI — Architectural Design Specification

## Overview

BizPilot AI is designed as a **modular monolith** combining high-performance API delivery, deterministic business calculations, predictive analytics, and LLM-driven reasoning.

## Core Architectural Principle

```
Database → Validated Data → Deterministic Calculations → Analytics
→ ML Predictions → Recommendation Engine → Evidence Package → LLM → Human-Readable Explanation
```

### Layer Responsibilities

1. **Database Layer (PostgreSQL + SQLAlchemy)**
   - Single source of truth for business data (users, businesses, memberships, sales, recipes, inventory, expenses).
   - Strict constraints, foreign keys, transaction boundaries, and ACID guarantees.

2. **Validation & DTO Layer (Pydantic)**
   - Guarantees strict input parsing, data integrity, and type validation at runtime.

3. **Authentication & Identity Layer (Phase 2)**
   - **Bcrypt Password Hashing**: Plaintext passwords are never stored or logged.
   - **Stateless JWT Tokens**: Signed bearer tokens with expiration claims (`sub`, `exp`, `type`).
   - **Tenant Data Isolation**: Business ownership and membership (`BusinessMembership`) enforce tenant boundaries.
   - **User → Business → Location Context**: Dependency injection providers (`get_current_user`, `get_current_business`, `require_business_role`) guarantee that User A cannot read or modify Business B entities.

4. **Deterministic Business Calculation Engine**
   - Precise arithmetic for inventory deduction (recipe explosion), gross margin, COGS, variance tracking, and waste cost.
   - **Zero LLM involvement** — logic is fully deterministic, unit-tested, and audited.

5. **Analytics & ML Engine**
   - Descriptive analytics (sales velocity, food cost % trends).
   - Time-series demand forecasting (Prophet / Holt-Winters / XGBoost).
   - Anomaly detection (unexpected waste spikes, margin erosion).

6. **Recommendation Engine & Evidence Packaging**
   - Converts analytical findings into actionable recommendations (e.g., "Reorder 20kg Coffee Beans by Tuesday").
   - Builds structured **Evidence Packages** containing metrics, historical benchmarks, and confidence scores.

7. **LLM Explainer & AI Copilot Layer**
   - Receives Evidence Packages and user natural language prompts.
   - Invokes tool-calling primitives to query analytics/inventory data safely.
   - Formulates clear, executive-level natural language explanations and conversational answers.

---

## Domain Model & Database Entities (Phase 2)

- **`User`**: Foundational user identity entity (`id`, `email`, `password_hash`, `full_name`, `is_active`, `last_login_at`, `created_at`, `updated_at`).
- **`Business`**: Business/location organization entity (`id`, `owner_user_id`, `name`, `business_type`, `currency`, `timezone`, `is_active`, `created_at`, `updated_at`).
- **`BusinessMembership`**: Relationship entity linking users to businesses with role attributes (`id`, `user_id`, `business_id`, `role`, `created_at`, `updated_at`). Enforces `UniqueConstraint('user_id', 'business_id')`.

---

## Directory & Package Conventions

The codebase separates concerns horizontally and vertically:

- `backend/app/core/`: Configuration (`config.py`), logging, exception handling, security (`security.py`).
- `backend/app/api/`: Versioned API controllers (`v1`), FastAPI dependencies (`deps.py`).
- `backend/app/models/`: Declarative SQLAlchemy models (`user.py`, `business.py`, `membership.py`).
- `backend/app/schemas/`: Typed Pydantic schemas (`auth.py`, `business.py`).
- `backend/app/db/`: Database session management (`session.py`), declarative base (`base.py`), Alembic migrations (`migrations/`).
- `backend/app/analytics/`: Modular domain package for analytics calculations.
- `backend/app/forecasting/`: Demand forecasting algorithms and models.
- `backend/app/inventory/`: Stock calculation engine, deduction logic, reorder rules.
- `backend/app/recommendations/`: Recommendation rules & ML logic.
- `backend/app/ai_copilot/`: Tool definitions, prompt orchestration, and LLM agent handlers.
- `backend/app/notifications/`: Dispatcher for alerts, emails, and webhooks.
- `backend/app/jobs/`: Background task handlers.

---

## Frontend Architecture

- **React 18/19 + TypeScript**: Type-safe component tree.
- **Vite**: Ultra-fast build and hot module replacement.
- **Tailwind CSS**: Utility-first responsive design system.
- **Zustand**: Predictable state management (`useAuthStore`, `useHealthStore`).
- **Authentication & App Shell**: Session persistence via `localStorage`, protected routes (`ProtectedRoute`), header business selector, and dynamic App Shell (`AppShell.tsx`).
