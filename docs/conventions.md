# BizPilot AI — Development Conventions & Guidelines

## 1. Python & Backend Conventions

- **FastAPI Style**: Use standard FastAPI router pattern with dependency injection (`app/api/deps.py`).
- **Pydantic**: Use Pydantic v2 schemas for all requests, responses, and internal configurations.
- **SQLAlchemy 2.0**: Use standard `select()`, `Mapped[...]`, `mapped_column()` syntax.
- **Error Handling**: All custom errors must inherit from `AppException` in `app.core.exceptions`. Never leak raw database stack traces or HTTP 500s to clients without JSON formatting.
- **Response Format**: Standard error responses follow:
  ```json
  {
    "error": {
      "code": "error_code_snake_case",
      "message": "Human readable summary of the error."
    }
  }
  ```

---

## 2. TypeScript & Frontend Conventions

- **Strict Mode**: `tsconfig.json` requires strict type checking (`"strict": true`). No implicit `any`.
- **Path Aliases**: Always use `@/` path alias pointing to `src/` (e.g., `@/components/HealthStatus`).
- **State Management**: Use Zustand stores (`src/store/`) for global client state.
- **Styling**: Tailwind CSS utility classes with structured class sorting.
- **Component Organization**:
  - `src/components/`: Reusable primitive UI components.
  - `src/features/[domain]`: Domain-specific components, hooks, and types.
  - `src/pages/`: Router views.
  - `src/layouts/`: Frame layouts (e.g. `ShellLayout`).

---

## 3. Git & Commit Guidelines

- Use conventional commits format:
  - `feat(backend): add sales API endpoint`
  - `fix(frontend): resolve layout overflow on mobile`
  - `chore: update dependencies`
  - `docs: update setup guide`
- Never commit secrets or `.env` files containing real API keys or DB passwords.
