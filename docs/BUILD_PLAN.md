# Budg Build Plan

This build plan is based on the Budg PRD and your clarifications. Tasks are grouped by high-level phases, with granular checklist items for each phase. Tasks are further grouped by frontend and backend where appropriate.

---

## Phase 1: Project Setup

### Backend
- [X] Initialize backend project (Python + FastAPI)
- [X] Set up virtual environment and dependency management (e.g., pipenv or poetry)
- [X] Configure PostgreSQL database connection
- [X] Set up environment variable management
- [X] Initialize database migration tool (e.g., Alembic)
- [X] Set up basic project structure (app, models, routers, services, tests)
- [X] Configure logging (Python logging module)
- [ ] Set up basic Application Performance Monitoring (APM) (e.g., Sentry or OpenTelemetry)
- [ ] Initialize Git repository and .gitignore

### Frontend
- [ ] Initialize frontend project (Vue 3 + Vite for simplicity and speed)
- [ ] Set up project structure (components, views, services, store)
- [ ] Configure environment variables
- [ ] Set up basic styling (CSS modules or Tailwind CSS)
- [ ] Initialize Git repository and .gitignore

---

## Phase 2: Core Data Models & API

### Backend
- [ ] Design and implement SQLAlchemy models for:
  - [ ] User (with email/password, MFA fields)
  - [ ] BankAccount
  - [ ] Bill
  - [ ] DueBill
  - [ ] BankAccountInstance
  - [ ] Status
  - [ ] Recurrence
  - [ ] Category
  - [ ] AuditLog
- [ ] Create Alembic migrations for all models
- [ ] Implement Pydantic schemas for API input/output
- [ ] Implement authentication (JWT-based, email/password)
- [ ] Implement password reset (with email sending via SMTP or a simple provider)
- [ ] Implement multifactor authentication (MFA) (TOTP-based)
- [ ] Implement API endpoints for CRUD operations on all models
- [ ] Implement API endpoints for login, signup, password reset, MFA
- [ ] Implement API endpoint for user session management
- [ ] Implement API endpoint for audit logging

---

## Phase 3: Basic UI & Authentication

### Frontend
- [ ] Set up routing (Vue Router)
- [ ] Implement authentication pages:
  - [ ] Signup
  - [ ] Login
  - [ ] Password reset
  - [ ] MFA setup and verification
- [ ] Implement session management (store JWT, handle expiration)
- [ ] Implement basic layout (header, navigation, main content area)
- [ ] Implement error and success notifications

---

## Phase 4: Main Table View & Core Features

### Backend
- [ ] Implement API endpoints for:
  - [ ] Fetching bills and bank account instances (with filtering, sorting, grouping)
  - [ ] Creating, editing, deleting DueBills and BankAccountInstances
  - [ ] Drag-and-drop reordering (update priority field)
  - [ ] Date range filtering
  - [ ] Projected balance calculation
  - [ ] Grouping by bank account/draft account

### Frontend
- [ ] Implement main table view:
  - [ ] Display bills and bank account instances in a spreadsheet-like table
  - [ ] Support sorting and filtering
  - [ ] Group by bank account/draft account
  - [ ] Show projected balances as subtotals
  - [ ] Highlight rows by status color
  - [ ] Set row text color from bank account font color
  - [ ] Implement drag-and-drop row reordering
  - [ ] Update order in backend (priority field)
  - [ ] Implement hover effects for rows and columns
  - [ ] Show prompt to add first bill if list is empty
  - [ ] Hide table if bills list is empty
  - [ ] Implement date range selector (with default values as per PRD)
  - [ ] Filter table by selected date range
  - [ ] Inline edit/delete controls for each row
  - [ ] Double-click row to open edit modal
  - [ ] Modal popups for adding/editing DueBills and BankAccountInstances

---

## Phase 5: Management Pages

### Backend
- [ ] Implement API endpoints for:
  - [ ] CRUD for Bank Accounts
  - [ ] CRUD for Bills
  - [ ] CRUD for Categories
  - [ ] CRUD for Statuses
  - [ ] CRUD for Recurrences

### Frontend
- [ ] Implement management pages for:
  - [ ] Bank Accounts
  - [ ] Bills
  - [ ] Categories
  - [ ] Statuses
  - [ ] Recurrences
- [ ] Add nested tabs above table view for navigation
- [ ] Add "Add new" option at bottom of dropdown selectors (opens add modal)
- [ ] Add "Add" hyperlink next to each dropdown label (opens add modal)

---

## Phase 6: Automation & Advanced Features

### Backend
- [ ] Implement logic to automatically generate next DueBill based on recurrence
- [ ] Implement logic to automatically generate next BankAccountInstance based on recurrence
- [ ] Implement manual trigger endpoint for automation
- [ ] Ensure all user changes are persisted and loaded on app reopen

### Frontend
- [ ] Add controls to manually trigger automation for DueBills and BankAccountInstances

---

## Phase 7: Security & Non-Functional Requirements

### Backend
- [ ] Ensure all sensitive data is encrypted at rest and in transit
- [ ] Implement rate limiting and brute-force protection for authentication endpoints
- [ ] Ensure all endpoints require authentication (where appropriate)
- [ ] Implement audit logging for key events

### Frontend
- [ ] Ensure all sensitive actions require authentication
- [ ] Implement logout and session expiration handling

---

## Phase 8: Testing

### Backend
- [ ] Write unit tests for all models, services, and endpoints (Pytest)
- [ ] Write integration tests for authentication and core flows
- [ ] Write E2E tests for critical user flows (e.g., using Playwright or Selenium)

### Frontend
- [ ] Write unit tests for components and services (Vitest or Jest)
- [ ] Write E2E tests for main user flows (e.g., using Cypress or Playwright)

---

## Phase 9: Local Deployment & Documentation

- [ ] Write setup instructions for local development (backend and frontend)
- [ ] Write database setup and migration instructions
- [ ] Document environment variables and configuration
- [ ] Document API endpoints (OpenAPI/Swagger for backend)
- [ ] Document main user flows and features
- [ ] Test full local deployment (end-to-end)

---

## Phase 10: Monitoring & Logging

### Backend
- [ ] Set up application logging (errors, warnings, key events)
- [ ] Set up basic APM (e.g., Sentry or OpenTelemetry) for performance monitoring
- [ ] Configure alerts for performance degradation (if possible in local/dev)

---

## Phase 11: Review & Polish

- [ ] Review all features against PRD acceptance criteria
- [ ] Fix any outstanding bugs or issues
- [ ] Refactor code for clarity and maintainability
- [ ] Finalize documentation

---

**End of Build Plan** 