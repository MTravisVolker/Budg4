# Budg

**Budg** is a modern, web-based budgeting application designed to help users manage personal finances by tracking bank accounts, credit card accounts, and bills. It provides a clear, spreadsheet-like view of current account balances, upcoming and paid bills, and projected balances after bill payments. Budg emphasizes manual data entry, user privacy, and a clean, intuitive interface.

---

## Table of Contents

- [Budg](#budg)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [UI Modernization \& Tailwind CSS Integration](#ui-modernization--tailwind-css-integration)
  - [Screenshots](#screenshots)
  - [Getting Started](#getting-started)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [Database Schema](#database-schema)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

---

## Features

- **Spreadsheet-like Table View**: Instantly see all bills and accounts in a sortable, filterable table.
- **Manual Data Entry**: No bank integrations; you control your data.
- **Custom Categories & Statuses**: Organize bills and accounts your way.
- **Recurring Bills & Accounts**: Automate due bill and account instance creation based on recurrence rules.
- **Drag-and-Drop Prioritization**: Reorder bills visually; priority is saved.
- **Date Range Filtering**: Focus on the period that matters to you.
- **Inline Editing & Modals**: Add, edit, or delete bills and accounts without leaving the main view.
- **Authentication & Security**: Secure login, JWT-based API, optional multi-factor authentication.
- **Audit Logging**: Track changes for transparency and troubleshooting.
- **Responsive UI**: Works on desktop, tablet, and mobile browsers.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Axios, CSS
- **Backend**: Django 5, Django REST Framework, SimpleJWT
- **Database**: SQLite (dev), designed for PostgreSQL in production
- **Other**: Modern ESLint config, modular monorepo structure

---

## UI Modernization & Tailwind CSS Integration

- Integrated **Tailwind CSS** for utility-first, responsive styling across the frontend.
- Added **DaisyUI** for pre-styled, themeable React components.
- Configured Tailwind with the official **forms plugin** for better form styling.
- Updated the React login and bills table UI to use DaisyUI cards, tables, modals, and buttons for a modern, clean look.
- Fixed PostCSS configuration for compatibility with ES modules and the latest Tailwind requirements.
- All new UI code uses Tailwind and DaisyUI classes for rapid, consistent development.

---

## Screenshots

*(Add screenshots or animated GIFs of the main table view, modals, and management pages here)*

---

## Getting Started

### Backend Setup

1. **Install Python dependencies** (recommend using a virtual environment):

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Apply migrations and create a superuser:**

   ```bash
   python ../manage.py migrate
   python ../manage.py createsuperuser
   ```

3. **Run the backend server:**

   ```bash
   python ../manage.py runserver
   ```

   The API will be available at `http://localhost:8000/`.

### Frontend Setup

1. **Install Node.js dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend dev server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173/` (or as indicated in the terminal).

3. **Configure API URL** (if needed):  
   By default, the frontend expects the backend at `/api/`. Adjust proxy settings in `vite.config.ts` if your backend runs elsewhere.

---

## Database Schema

Budg's schema is designed for flexibility and security. Key entities include:

- **User**: Authentication, MFA, and user settings.
- **Bank Account**: Track multiple accounts, each with a custom color.
- **Bill**: Define recurring or one-off bills, assign categories and accounts.
- **Due Bill**: Instances of bills with specific due dates and payment info.
- **Bank Account Instance**: Snapshots of account balances at specific times.
- **Category, Status, Recurrence**: User-defined for full customization.
- **Audit Log**: Tracks all changes for transparency.

See [`docs/Budg Database Schema Design.md`](docs/Budg%20Database%20Schema%20Design.md) and [`docs/Budg ERD.md`](docs/Budg%20ERD.md) for full details.

---

## Project Structure

```
.
├── backend/         # Django backend (API, models, auth)
├── core/            # Main Django app (models, views, serializers)
├── frontend/        # React frontend (Vite, TypeScript)
├── docs/            # Product docs, schema, build plan
├── manage.py        # Django entry point
└── db.sqlite3       # SQLite database (dev)
```

---

## Contributing

1. Fork the repo and create your branch from `main`.
2. Follow code style and linting rules (`eslint` for frontend, `black` for backend).
3. Add tests for new features.
4. Open a pull request with a clear description.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Inspired by the need for a simple, privacy-focused budgeting tool.
- Built with ❤️ by Travis Volker and contributors.

---

**For more details, see the [Product Requirements Document](docs/Budg%20PRD.md) and [Build Plan](docs/BUILD_PLAN.md).** 