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
   - Single source of truth for business data (sales, recipes, inventory, expenses).
   - Strict constraints, foreign keys, transaction boundaries, and ACID guarantees.

2. **Validation & DTO Layer (Pydantic)**
   - Guarantees strict input parsing, data integrity, and type validation at runtime.

3. **Deterministic Business Calculation Engine**
   - Precise arithmetic for inventory deduction (recipe explosion), gross margin, COGS, variance tracking, and waste cost.
   - **Zero LLM involvement** — logic is fully deterministic, unit-tested, and audited.

4. **Analytics & ML Engine**
   - Descriptive analytics (sales velocity, food cost % trends).
   - Time-series demand forecasting (Prophet / Holt-Winters / XGBoost).
   - Anomaly detection (unexpected waste spikes, margin erosion).

5. **Recommendation Engine & Evidence Packaging**
   - Converts analytical findings into actionable recommendations (e.g., "Reorder 20kg Coffee Beans by Tuesday").
   - Builds structured **Evidence Packages** containing metrics, historical benchmarks, and confidence scores.

6. **LLM Explainer & AI Copilot Layer**
   - Receives Evidence Packages and user natural language prompts.
   - Invokes tool-calling primitives to query analytics/inventory data safely.
   - Formulates clear, executive-level natural language explanations and conversational answers.

---

## Directory & Package Conventions

The codebase separates concerns horizontally and vertically:

- `backend/app/core/`: Configuration, logging, exception handling, security stubs.
- `backend/app/api/`: Versioned API controllers (`v1`), FastAPI dependencies.
- `backend/app/db/`: Database session management, declarative models, Alembic migrations.
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
- **Zustand**: Lightweight, predictable state management.
- **Feature-first organization (`src/features/`)**: Modules organized by domain capability.
