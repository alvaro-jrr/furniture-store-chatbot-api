# Furniture Store Chatbot API

## Requirements

-   [Node.js](https://nodejs.org/es)

## Run the Project

1. Install [pnpm](https://pnpm.io/).
2. Run `pnpm install`.
3. Create an `.env` based on the `.env.example`.
4. Run `pnpm drizzle-kit generate:mysql` to generate the migration.
5. Run `pnpm run dev` and open `http://localhost:3000`.

## Database

#### Generate migration

```
pnpm drizzle-kit generate:mysql
```

#### Run the migrations

```
pnpm tsx src/database/migrate.ts
```
