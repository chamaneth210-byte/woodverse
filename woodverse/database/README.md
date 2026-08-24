# Database

PostgreSQL schema and seed data for WoodVerse.

## Contents

- `schema.sql` - Database schema with tables, indexes, and constraints
- `seed.sql` - Seed data for development

## Setup

1. Create a PostgreSQL database:
    ```bash
    createdb woodverse
    ```

2. Apply the schema:
    ```bash
    psql -d woodverse -f database/schema.sql
    ```

3. Apply seed data (optional):
    ```bash
    psql -d woodverse -f database/seed.sql
    ```

## Connection

Set the `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://woodverse:woodverse@localhost:5432/woodverse
```

The API service (`backend/api`) connects to this database on startup.
