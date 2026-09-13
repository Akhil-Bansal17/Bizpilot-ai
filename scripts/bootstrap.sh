#!/usr/bin/env bash

# BizPilot AI Bootstrap Helper Script

set -e

echo "🚀 Bootstrapping BizPilot AI development environment..."

# 1. Create backend .env if missing
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from template..."
  cp backend/.env.example backend/.env
else
  echo "backend/.env already exists."
fi

# 2. Create frontend .env if missing
if [ ! -f frontend/.env ]; then
  echo "Creating frontend/.env from template..."
  cp frontend/.env.example frontend/.env
else
  echo "frontend/.env already exists."
fi

echo "✅ Environment files ready."
echo "Run 'docker-compose up --build' or follow docs/setup.md to run locally."
