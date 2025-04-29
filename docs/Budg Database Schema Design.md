# Budgeting App Database Schema Design

## Overview

This document defines the database schema for **Budg**, a web-based budgeting application for managing personal finances, including bank accounts, and bills. The schema supports manual data entry, user-configurable categories, bill recurrences, and a spreadsheet-like interface, as outlined in the Product Requirements Document (PRD). It is designed for a PostgreSQL database and includes tables for users, authentication, bank accounts, bills, due bills, bank account instances, statuses, recurrences, categories, and audit logs. The schema ensures data integrity, security, scalability, and performance, with support for FastAPI Users, JWT, and OAuth2 authentication.

## Schema Design

### 1. User

Stores user authentication data, aligned with FastAPI Users for JWT and OAuth2 support.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY | Unique identifier for the user. |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address for login. |
| hashed_password | VARCHAR(255) | NOT NULL | Hashed password for secure login. |
| is_active | BOOLEAN | DEFAULT TRUE | Indicates if the user account is active. |
| is_superuser | BOOLEAN | DEFAULT FALSE | Indicates if the user is an admin. |
| is_verified | BOOLEAN | DEFAULT FALSE | Indicates if the email is verified. |
| mfa_enabled | BOOLEAN | DEFAULT FALSE | Indicates if multifactor authentication is enabled. |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp. |

**Indexes**:

- UNIQUE INDEX on `email`

### 2. Api_Token

Stores JWT API tokens for user authentication.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SERIAL | PRIMARY KEY | Unique identifier for the token. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the token. |
| token | TEXT | NOT NULL, UNIQUE | JWT token string. |
| issued_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Token issuance timestamp. |
| expires_at | TIMESTAMP |  | Token expiration timestamp (nullable). |

**Indexes**:

- INDEX on `user_id`
- UNIQUE INDEX on `token`

### 3. OAuth_Account

Stores linked OAuth2 accounts (e.g., Google, GitHub).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SERIAL | PRIMARY KEY | Unique identifier for the OAuth account. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the account. |
| provider | VARCHAR(50) | NOT NULL | OAuth provider (e.g., "google"). |
| account_id | VARCHAR(255) | NOT NULL | Provider-specific account ID. |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |

**Indexes**:

- INDEX on `user_id`
- UNIQUE INDEX on (`provider`, `account_id`)

### 4. Bill_Status

Stores status types for due bills and bank account instances (e.g., "Paid", "Upcoming").

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the status. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the Bill Status. |
| name | VARCHAR(100) | NOT NULL | Status name (e.g., "Paid"). |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the status is archived. |
| highlight_color_hex | VARCHAR(7) |  | Hex color code for UI highlighting (e.g., "#FF0000"). |

**Indexes**:

- INDEX on `user_id`
- INDEX on `name`

### 5. Recurrence

Stores recurrence patterns for bills and bank account paydays (e.g., monthly, bi-monthly).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the recurrence. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the Recurrence. |
| name | VARCHAR(100) | NOT NULL | Recurrence name (e.g., "Monthly"). |
| calculation | VARCHAR(20) |  | Recurrence logic. |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the recurrence is archived. |

**Indexes**:

- INDEX on `user_id`
- INDEX on `name`

### 6. Category

Stores user-defined categories for organizing bills (e.g., "Utilities", "Insurance").

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the category. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the category. |
| name | VARCHAR(100) | NOT NULL | Category name. |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the category is archived. |

**Indexes**:

- INDEX on `user_id`
- INDEX on `name`

### 7. Bank_Account

Stores bank or credit card account details, including payday recurrence.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the account. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the account. |
| name | VARCHAR(100) | NOT NULL | Account name (e.g., "Checking"). |
| url | VARCHAR(100) | CHECK (url \~ '^https?://') | URL for bill payment (optional). |
| recurrence | SMALLINT | FOREIGN KEY (Recurrence.id) | Payday recurrence for the account (nullable). |
| recurrence_value | INTEGER | CHECK (recurrence_value &gt; 0) | Specific interval for recurrence (nullable). |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the account is archived. |
| font_color_hex | VARCHAR(7) | NOT NULL, CHECK (font_color_hex \~ '^#\[0-9A-Fa-f\]{6}$') | Hex color code for UI text (e.g., "#0000FF"). |

**Indexes**:

- INDEX on `user_id`
- INDEX on `name`
- INDEX on `recurrence`

**Notes**:

- `recurrence_value` is required for `n_days` and `n_months`, otherwise nullable.

### 8. Bills

Stores bill definitions with default settings.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the bill. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the bill. |
| name | VARCHAR(100) | NOT NULL | Bill name (e.g., "Electric"). |
| default_amount_due | DECIMAL(10,2) | NOT NULL | Default amount due for the bill. |
| url | VARCHAR(100) | CHECK (url \~ '^https?://') | URL for bill payment (optional). |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the bill is archived. |
| default_draft_account | SMALLINT | FOREIGN KEY (Bank_Account.id) | Default account for bill payments. |
| category | SMALLINT | FOREIGN KEY (Category.id) | Category for organizing the bill. |
| recurrence | SMALLINT | FOREIGN KEY (Recurrence.id) | Payday recurrence for the account (nullable). |
| recurrence_value | INTEGER | CHECK (recurrence_value &gt; 0) | Number of days or months for n_days/n_months (nullable). |

**Indexes**:

- INDEX on `user_id`
- INDEX on `name`
- INDEX on `default_draft_account`
- INDEX on `category`

**Notes**:

- `recurrence_value` is required for `n_days` and `n_months`, otherwise nullable.

### 9. Due_Bills

Stores instances of bills with specific due dates and payment details.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the due bill. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the due bill. |
| bill | SMALLINT | FOREIGN KEY (Bills.id) | Reference to the bill definition. |
| recurrence | SMALLINT | FOREIGN KEY (Recurrence.id) | Recurrence pattern for the bill. |
| recurrence_value | INTEGER | CHECK (recurrence_value &gt; 0) | Specific interval for recurrence (nullable). |
| priority | INTEGER | NOT NULL, DEFAULT 0 | Priority for UI ordering. |
| due_date | DATE | NOT NULL | Date the bill is due. |
| pay_date | DATE |  | Date the bill was paid (optional). |
| min_amount_due | DECIMAL(10,2) | NOT NULL | Minimum amount due. |
| total_amount_due | DECIMAL(10,2) | NOT NULL | Total amount due. |
| status | SMALLINT | FOREIGN KEY (Bill_Status.id) | Status of the bill (e.g., "Paid"). |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the due bill is archived. |
| confirmation | VARCHAR(100) |  | Confirmation number for payment (optional). |
| notes | TEXT |  | Additional notes for the bill. |
| draft_account | SMALLINT | FOREIGN KEY (Bank_Account.id) | Account used for payment. |

**Indexes**:

- INDEX on `user_id`
- INDEX on `bill`
- INDEX on `recurrence`
- INDEX on `due_date`
- INDEX on `pay_date`
- INDEX on `status`
- INDEX on `draft_account`
- INDEX on `priority`

**Notes**:

- `draft_account` defaults to the `default_draft_account` from the related `Bills` record.
- `min_amount_due` defaults to the `default_amount_due` from the related `Bills` record.
- `priority` defaults to 0 to support drag-and-drop reordering.

### 10. Bank_Account_Instance

Stores snapshots of bank account balances at specific times.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SMALLSERIAL | PRIMARY KEY | Unique identifier for the instance. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User associated with the instance. |
| bank_account | SMALLINT | FOREIGN KEY (Bank_Account.id) | Reference to the bank account. |
| priority | INTEGER | NOT NULL, DEFAULT 0 | Priority for UI ordering. |
| due_date | DATE | NOT NULL | Date associated with the balance. |
| pay_date | DATE |  | Date of payment or update (optional). |
| status | SMALLINT | FOREIGN KEY (Bill_Status.id) | Status of the instance (e.g., "Current"). |
| archived | BOOLEAN | DEFAULT FALSE | Indicates if the instance is archived. |
| current_balance | DECIMAL(10,2) | NOT NULL | Balance of the account at this instance. |

**Indexes**:

- INDEX on `user_id`
- INDEX on `bank_account`
- INDEX on `due_date`
- INDEX on `pay_date`
- INDEX on `status`
- INDEX on `priority`

**Notes**:

- Uses `Bank_Account.name` for display purposes instead of a separate `name` field.

### 11. Audit_Log

Tracks changes to all tables except itself for auditing purposes.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| id | SERIAL | PRIMARY KEY | Unique identifier for the log entry. |
| user_id | UUID | FOREIGN KEY (User.id), NOT NULL | User who performed the action. |
| table_name | VARCHAR(50) | NOT NULL | Name of the affected table (e.g., "Due_Bills"). |
| row_id | INTEGER | NOT NULL | ID of the affected row. |
| field_name | VARCHAR(100) | NOT NULL | Name of the affected field. |
| action | VARCHAR(20) | NOT NULL, CHECK (action IN ('add', 'update', 'delete')) | Action performed. |
| value_before_change | TEXT |  | Value before the change (nullable). |
| value_after_change | TEXT |  | Value after the change (nullable). |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Time of the action. |

**Indexes**:

- INDEX on `user_id`
- INDEX on `table_name`
- INDEX on `row_id`
- INDEX on `timestamp`

## Relationships

- `User` ↔ `Api_Token`: One user can have many API tokens (1:N).
- `User` ↔ `OAuth_Account`: One user can have many OAuth accounts (1:N).
- `User` ↔ `Audit_Log`: One user can have many audit log entries (1:N).
- `User` ↔ `Bill_Status`: One user can have many bill statuses (1:N).
- `User` ↔ `Recurrence`: One user can have many recurrences (1:N).
- `User` ↔ `Category`: One user can have many categories (1:N).
- `User` ↔ `Bank_Account`: One user can have many bank accounts (1:N).
- `User` ↔ `Bills`: One user can have many bills (1:N).
- `User` ↔ `Due_Bills`: One user can have many due bills (1:N).
- `User` ↔ `Bank_Account_Instance`: One user can have many bank account instances (1:N).
- `Bill_Status` ↔ `Due_Bills`: One status can apply to many due bills (1:N).
- `Bill_Status` ↔ `Bank_Account_Instance`: One status can apply to many instances (1:N).
- `Recurrence` ↔ `Bank_Account`: One recurrence can apply to many bank accounts (1:N).
- `Recurrence` ↔ `Due_Bills`: One recurrence can apply to many due bills (1:N).
- `Category` ↔ `Bills`: One category can apply to many bills (1:N).
- `Bank_Account` ↔ `Bills`: One bank account can be the default draft account for many bills (1:N).
- `Bank_Account` ↔ `Due_Bills`: One bank account can be the draft account for many due bills (1:N).
- `Bank_Account` ↔ `Bank_Account_Instance`: One bank account can have many instances (1:N).
- `Bills` ↔ `Due_Bills`: One bill can have many due bill instances (1:N).

## Notes

- **Data Types**: Used `SMALLSERIAL` for tables with low row counts (e.g., `Bill_Status`, `Recurrence`) and `SERIAL` or `UUID` for high-row-count tables (e.g., `User`, `Audit_Log`). `DECIMAL(10,2)` ensures precision for financial amounts.
- **Indexes**: Added indexes on fields used for filtering, sorting, and joining (e.g., `due_date`, `pay_date`, `priority`) to support User Story #22 (ordering by draft account, priority, pay date, due date). Added indexes on `user_id` for new foreign keys in `Category`, `Bank_Account`, `Bills`, `Due_Bills`, and `Bank_Account_Instance`.
- **Constraints**: Added CHECK constraints for `font_color_hex`, `highlight_color_hex` (valid hex), `url` (basic URL format), and `calculation` (predefined recurrence options). New `user_id` foreign keys are `NOT NULL`.
- **Defaults**: `archived` defaults to `FALSE`, `priority` defaults to 0, `min_amount_due` and `draft_account` in `Due_Bills` default to values from `Bills`.
- **Authentication**: `User`, `Api_Token`, and `OAuth_Account` tables support FastAPI Users with JWT and OAuth2.
- **Auditing**: `Audit_Log` tracks changes to all tables except itself, with field-level logging using `TEXT` for `value_before_change` and `value_after_change`.
- **Recurrence**: `recurrence_value` in `Recurrence`, `Bank_Account`, and `Due_Bills` supports flexible "n_days" and "n_months" calculations.

## Future Considerations

- **Multi-Currency Support**: Add a `currency` field to `Bank_Account` and `Bills` if needed.
- **Custom Recurrence Logic**: Extend `Recurrence` with additional calculation types for user-defined recurrences.
- **Performance**: Monitor query performance and add composite indexes (e.g., on `due_date` and `draft_account`) for large datasets. Evaluate performance of new `user_id` indexes.