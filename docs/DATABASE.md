# Diseño de Base de Datos - SAVING PIG

El esquema de base de datos de SAVING PIG está diseñado para ser eficiente, relacional y seguro, utilizando PostgreSQL en Supabase.

## Diagrama de Entidad-Relación (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : "tiene"
    USERS ||--o{ CATEGORIES : "crea"
    USERS ||--o{ TRANSACTIONS : "registra"
    USERS ||--o{ GOALS : "establece"
    ACCOUNTS ||--o{ TRANSACTIONS : "originan"
    CATEGORIES ||--o{ TRANSACTIONS : "clasifican"
    TRANSACTIONS ||--o{ EVIDENCES : "requiere"
    USERS ||--o{ ALERTS : "recibe"
    USERS ||--o{ ADVICES : "recibe"
    USERS ||--o{ PREDICTIONS : "consulta"

    USERS {
        uuid id PK
        string full_name
        string email
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string name
        decimal balance
        string currency
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        uuid category_id FK
        decimal amount
        string type
        string description
        timestamp date
    }

    EVIDENCES {
        uuid id PK
        uuid transaction_id FK
        string file_path
    }

    GOALS {
        uuid id PK
        uuid user_id FK
        string name
        decimal target_amount
        decimal current_amount
        date deadline
    }
```

## Tablas Principales

### `accounts`

Gestiona los diferentes orígenes de dinero (Efectivo, Banco, etc.).

- **Atributos:** `id`, `user_id`, `name`, `balance`, `currency`.

### `transactions`

Registra cada movimiento financiero.

- **Atributos:** `id`, `amount`, `type` (income/expense), `description`, `date`.

### `evidences`

Almacena la ruta de las imágenes subidas al Storage de Supabase.

- **Atributos:** `file_path`, `transaction_id`.

### `goals`

Permite el seguimiento de metas de ahorro.

- **Atributos:** `target_amount`, `current_amount`, `deadline`.

### `categories`

Clasificación personalizada de transacciones.

- **Atributos:** `name`, `type`, `icon`, `color`.
