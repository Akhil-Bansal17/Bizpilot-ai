# BizPilot AI — Onboarding & Setup Guide

This document guides developers through setting up the BizPilot AI development environment from a fresh repository clone.

## Prerequisites

- **Python**: 3.11+ (Python 3.12 or 3.14 supported)
- **Node.js**: v18+ (Node 24 LTS recommended)
- **npm**: 9+
- **Docker & Docker Compose** (Optional, recommended for database and container testing)
- **Git**

---

## Environment Setup Instructions

### 1. Clone & Bootstrap Script

Run the helper bootstrap script to create default environment files:

```bash
# On Linux / macOS / Bash
bash scripts/bootstrap.sh
```

Or manually copy `.env.example` files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Running with Docker Compose

```bash
# Start all services (PostgreSQL, FastAPI Backend, React Frontend)
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

---

## Running Manually for Local Development

### Step A: Database (PostgreSQL)

If not using Docker for the entire app, run PostgreSQL locally or via Docker:

```bash
docker run -d --name bizpilot-postgres \
  -e POSTGRES_USER=bizpilot_user \
  -e POSTGRES_PASSWORD=bizpilot_password \
  -e POSTGRES_DB=bizpilot_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### Step B: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Run migrations
alembic upgrade head

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

### Step C: Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

---

## Running Verification & Tests

### Backend Tests & Linting

```bash
cd backend
pytest
ruff check app tests
mypy app
```

### Frontend Tests & Typecheck

```bash
cd frontend
npm test
npm run typecheck
npm run lint
```
