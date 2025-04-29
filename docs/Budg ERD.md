erDiagram
    User {
        UUID id PK
        VARCHAR(255) email UNIQUE NOT NULL
        VARCHAR(255) hashed_password NOT NULL
        BOOLEAN is_active DEFAULT TRUE
        BOOLEAN is_superuser DEFAULT FALSE
        BOOLEAN is_verified DEFAULT FALSE
        BOOLEAN mfa_enabled DEFAULT FALSE
        TIMESTAMP created_at DEFAULT CURRENT_TIMESTAMP
        TIMESTAMP updated_at DEFAULT CURRENT_TIMESTAMP
    }
    Api_Token {
        SERIAL id PK
        UUID user_id FK NOT NULL
        TEXT token UNIQUE NOT NULL
        TIMESTAMP issued_at DEFAULT CURRENT_TIMESTAMP
        TIMESTAMP expires_at
    }
    OAuth_Account {
        SERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(50) provider NOT NULL
        VARCHAR(255) account_id NOT NULL
        TIMESTAMP created_at DEFAULT CURRENT_TIMESTAMP
    }
    Bill_Status {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(100) name NOT NULL
        BOOLEAN archived DEFAULT FALSE
        VARCHAR(7) highlight_color_hex
    }
    Recurrence {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(100) name NOT NULL
        VARCHAR(20) calculation
        BOOLEAN archived DEFAULT FALSE
    }
    Category {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(100) name NOT NULL
        BOOLEAN archived DEFAULT FALSE
    }
    Bank_Account {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(100) name NOT NULL
        VARCHAR(100) url
        SMALLINT recurrence FK
        INTEGER recurrence_value
        BOOLEAN archived DEFAULT FALSE
        VARCHAR(7) font_color_hex NOT NULL
    }
    Bills {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(100) name NOT NULL
        DECIMAL(10,2) default_amount_due NOT NULL
        VARCHAR(100) url
        BOOLEAN archived DEFAULT FALSE
        SMALLINT default_draft_account FK
        SMALLINT category FK
        SMALLINT recurrence FK
        INTEGER recurrence_value
    }
    Due_Bills {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        SMALLINT bill FK
        SMALLINT recurrence FK
        INTEGER recurrence_value
        INTEGER priority DEFAULT 0 NOT NULL
        DATE due_date NOT NULL
        DATE pay_date
        DECIMAL(10,2) min_amount_due NOT NULL
        DECIMAL(10,2) total_amount_due NOT NULL
        SMALLINT status FK
        BOOLEAN archived DEFAULT FALSE
        VARCHAR(100) confirmation
        TEXT notes
        SMALLINT draft_account FK
    }
    Bank_Account_Instance {
        SMALLSERIAL id PK
        UUID user_id FK NOT NULL
        SMALLINT bank_account FK
        INTEGER priority DEFAULT 0 NOT NULL
        DATE due_date NOT NULL
        DATE pay_date
        SMALLINT status FK
        BOOLEAN archived DEFAULT FALSE
        DECIMAL(10,2) current_balance NOT NULL
    }
    Audit_Log {
        SERIAL id PK
        UUID user_id FK NOT NULL
        VARCHAR(50) table_name NOT NULL
        INTEGER row_id NOT NULL
        VARCHAR(100) field_name NOT NULL
        VARCHAR(20) action NOT NULL
        TEXT value_before_change
        TEXT value_after_change
        TIMESTAMP timestamp DEFAULT CURRENT_TIMESTAMP
    }

    User ||--o{ Api_Token : "has"
    User ||--o{ OAuth_Account : "has"
    User ||--o{ Bill_Status : "has"
    User ||--o{ Recurrence : "has"
    User ||--o{ Category : "has"
    User ||--o{ Bank_Account : "has"
    User ||--o{ Bills : "has"
    User ||--o{ Due_Bills : "has"
    User ||--o{ Bank_Account_Instance : "has"
    User ||--o{ Audit_Log : "has"
    Bill_Status ||--o{ Due_Bills : "applies to"
    Bill_Status ||--o{ Bank_Account_Instance : "applies to"
    Recurrence ||--o{ Bank_Account : "applies to"
    Recurrence ||--o{ Due_Bills : "applies to"
    Category ||--o{ Bills : "categorizes"
    Bank_Account ||--o{ Bills : "default for"
    Bank_Account ||--o{ Due_Bills : "draft for"
    Bank_Account ||--o{ Bank_Account_Instance : "snapshots"
    Bills ||--o{ Due_Bills : "has"